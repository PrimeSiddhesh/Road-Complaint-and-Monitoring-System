const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");
const authMiddleware = require("../middleware/authMiddleware");
const { sendOtpEmail } = require("../config/email");

const router = express.Router();
const OTP_EXPIRY_MINUTES = 5;
const VERIFIED_WINDOW_MINUTES = 15;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_REQUESTS_PER_HOUR = 5;

// Diagnostic endpoint - test if email works
router.get("/test-email", async (req, res) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    const hasEmailUser = !!emailUser;
    const hasEmailPass = !!emailPass;
    const hasSmtpFrom = !!smtpFrom;

    if (!hasEmailUser || !hasEmailPass) {
      return res.status(400).json({
        error: "Email credentials not configured",
        hasEmailUser,
        hasEmailPass,
        hasSmtpFrom,
        message: "Missing EMAIL_USER or EMAIL_PASS in environment variables"
      });
    }

    // Try to send a test email
    const { sendOtpEmail: sendTestEmail } = require("../config/email");
    await sendTestEmail({
      toEmail: emailUser,
      otp: "123456",
      expiryMinutes: 5
    });

    return res.json({
      success: true,
      message: "Test email sent successfully",
      to: emailUser,
      hasEmailUser,
      hasEmailPass,
      hasSmtpFrom
    });
  } catch (error) {
    return res.status(500).json({
      error: "Test email failed",
      message: error.message,
      code: error.code,
      details: error.response || error.toString()
    });
  }
});

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const maskEmail = (email) => {
  const value = normalizeEmail(email);
  const [namePart, domainPart] = value.split("@");
  if (!namePart || !domainPart) {
    return "invalid-email";
  }

  const first = namePart[0] || "";
  return `${first}***@${domainPart}`;
};

const hashOtp = (email, otp) => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || "otp_secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${normalizeEmail(email)}:${String(otp).trim()}`)
    .digest("hex");
};

const isHashMatch = (a, b) => {
  if (!a || !b) {
    return false;
  }

  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
};

router.post("/send-otp", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "Email is required",
        error: "Email is required"
      });
    }

    console.log("[SEND_OTP_ROUTE] Processing OTP for", maskEmail(normalizedEmail));

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
        error: "Email is already registered"
      });
    }

    const now = new Date();
    const verification = await EmailVerification.findOne({ email: normalizedEmail });

    if (verification?.lastSentAt) {
      const elapsedSeconds = Math.floor((now.getTime() - verification.lastSentAt.getTime()) / 1000);
      if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          message: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds}s before requesting another OTP`,
          error: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds}s before requesting another OTP`
        });
      }
    }

    let windowStartedAt = verification?.windowStartedAt || now;
    let requestCount = verification?.requestCount || 0;
    if (now.getTime() - windowStartedAt.getTime() >= 60 * 60 * 1000) {
      windowStartedAt = now;
      requestCount = 0;
    }

    if (requestCount >= OTP_MAX_REQUESTS_PER_HOUR) {
      return res.status(429).json({
        message: "Too many OTP requests. Try again later.",
        error: "Too many OTP requests. Try again later."
      });
    }

    const otp = generateOtp();
    await sendOtpEmail({
      toEmail: normalizedEmail,
      otp,
      expiryMinutes: OTP_EXPIRY_MINUTES
    });

    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await EmailVerification.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otpHash: hashOtp(normalizedEmail, otp),
        otpExpiresAt,
        isVerified: false,
        verifiedAt: null,
        lastSentAt: now,
        windowStartedAt,
        requestCount: requestCount + 1
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      message: "OTP sent successfully",
      error: null,
      email: normalizedEmail,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60
    });
  } catch (error) {
    console.error("[SEND_OTP_ROUTE] Failed", {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack
    });

    return res.status(500).json({
      message: "Failed to send OTP",
      error: "Failed to send OTP",
      details: error.message,
      code: error.code,
      nodeEnv: process.env.NODE_ENV,
      emailUser: process.env.EMAIL_USER ? "SET" : "MISSING",
      emailPass: process.env.EMAIL_PASS ? "SET" : "MISSING",
      resendApiKey: process.env.RESEND_API_KEY ? "SET" : "MISSING",
      resendFrom: process.env.RESEND_FROM ? "SET" : "MISSING"
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const verification = await EmailVerification.findOne({ email: normalizedEmail });

    if (!verification || !verification.otpHash || !verification.otpExpiresAt) {
      return res.status(400).json({ error: "OTP not found. Please request OTP again." });
    }

    if (new Date() > verification.otpExpiresAt) {
      return res.status(400).json({ error: "OTP expired. Please request a new OTP." });
    }

    const isValidOtp = isHashMatch(verification.otpHash, hashOtp(normalizedEmail, otp));
    if (!isValidOtp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    verification.isVerified = true;
    verification.verifiedAt = new Date();
    verification.otpHash = null;
    verification.otpExpiresAt = new Date(Date.now() + VERIFIED_WINDOW_MINUTES * 60 * 1000);
    await verification.save();

    return res.json({
      message: "OTP verified successfully",
      email: normalizedEmail,
      isVerified: true
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "OTP verification failed" });
  }
});

router.post("/register", async (req, res) => {
  console.log("[REGISTER] req.body:", req.body);

  const { name, mobile, village, email, password } = req.body || {};

  const normalizedName = String(name || "").trim();
  const normalizedMobile = String(mobile || "").trim();
  const normalizedVillage = String(village || "").trim();
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password || "");

  const missingFields = [];
  if (!normalizedName) missingFields.push("name");
  if (!normalizedMobile) missingFields.push("mobile");
  if (!normalizedVillage) missingFields.push("village");
  if (!normalizedEmail) missingFields.push("email");
  if (!normalizedPassword.trim()) missingFields.push("password");

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(", ")}`,
      missingFields
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const verification = await EmailVerification.findOne({ email: normalizedEmail });

    if (!verification || !verification.isVerified || !verification.verifiedAt) {
      return res.status(400).json({ error: "Email not verified" });
    }

    const verificationAgeMs = Date.now() - verification.verifiedAt.getTime();
    if (verificationAgeMs > VERIFIED_WINDOW_MINUTES * 60 * 1000) {
      return res.status(400).json({ error: "Email verification expired. Please verify again." });
    }

    // Check duplicate user only in users collection (not emailverifications).
    const existingUserByEmail = await User.findOne({ email: normalizedEmail });
    if (existingUserByEmail) {
      return res.status(400).json({
        error: "User already exists, please login"
      });
    }

    const hashed = await bcrypt.hash(normalizedPassword, 10);

    const user = await User.create({
      name: normalizedName,
      mobile: normalizedMobile,
      village: normalizedVillage,
      email: normalizedEmail,
      password: hashed,
      isVerified: true,
      emailVerifiedAt: verification.verifiedAt
    });

    await EmailVerification.deleteOne({ email: normalizedEmail });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "your_jwt_secret");

    res.json({
      message: "Registered Successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        village: user.village,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error("[REGISTER] ERROR:", err);

    if (err && err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({
        error: `Duplicate ${duplicateField}. Please use a different ${duplicateField}.`
      });
    }

    return res.status(400).json({
      error: err?.message || "Registration failed"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/mobile and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier?.toLowerCase() }, { mobile: identifier }]
    });

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email with OTP before login",
        requiresVerification: true,
        email: user.email
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "your_jwt_secret");

    res.json({
      message: "Logged in successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        village: user.village,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Login failed" });
  }
});

// Get current user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch profile" });
  }
});

// Contact form — sends message to the super admin's email
router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const { sendContactEmail } = require("../config/email");
    await sendContactEmail({ name, email, subject, message });

    res.json({ message: "Your message has been sent successfully. We will get back to you soon." });
  } catch (err) {
    console.error("[CONTACT] Failed to send contact email", err.message);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
});

// Forgot Password — sends OTP to the registered user's email
router.post("/forgot-password", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) {
      return res.status(400).json({ error: "No account found with this email address" });
    }

    const otp = generateOtp();
    await sendOtpEmail({ toEmail: normalizedEmail, otp, expiryMinutes: OTP_EXPIRY_MINUTES });

    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await EmailVerification.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otpHash: hashOtp(normalizedEmail, otp),
        otpExpiresAt,
        isVerified: false,
        verifiedAt: null,
        lastSentAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "OTP sent to your email", email: normalizedEmail });
  } catch (err) {
    console.error("[FORGOT_PASSWORD]", err.message);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
});

// Reset Password — verify OTP and update password
router.post("/reset-password", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();
    const newPassword = String(req.body?.newPassword || "");

    if (!normalizedEmail || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const verification = await EmailVerification.findOne({ email: normalizedEmail });

    if (!verification || !verification.otpHash || !verification.otpExpiresAt) {
      return res.status(400).json({ error: "OTP not found. Please request a new OTP." });
    }

    if (new Date() > verification.otpExpiresAt) {
      return res.status(400).json({ error: "OTP expired. Please request a new OTP." });
    }

    const isValidOtp = isHashMatch(verification.otpHash, hashOtp(normalizedEmail, otp));
    if (!isValidOtp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP is valid — update the user's password
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email: normalizedEmail }, { password: hashed });

    // Clean up the verification record
    await EmailVerification.deleteOne({ email: normalizedEmail });

    res.json({ message: "Password reset successfully. You can now log in with your new password." });
  } catch (err) {
    console.error("[RESET_PASSWORD]", err.message);
    res.status(500).json({ error: "Password reset failed. Please try again." });
  }
});

module.exports = router;
