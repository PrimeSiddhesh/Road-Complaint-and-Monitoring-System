const path = require("path");
const dotenvResult = require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");

const fs = require("fs");
const app = express();

if (dotenvResult.error) {
  console.error("[ENV] Failed to load backend/.env", dotenvResult.error.message);
} else {
  console.log("[ENV] Loaded environment variables from backend/.env");
}

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "EMAIL_USER", "EMAIL_PASS"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error("[ENV] Missing required variables:", missingEnvVars.join(", "));
}

console.log("[ENV] OTP email config status", {
  hasEmailUser: Boolean(process.env.EMAIL_USER),
  hasEmailPass: Boolean(process.env.EMAIL_PASS),
  hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
});

// CORS — allow Vercel frontend + localhost dev
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("[CORS] Blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
};

// create uploads folder if missing (multer doesn't auto-create it)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// connect to mongo and start
const start = async () => {
  await connectDB();

  // Ensure the configured super admin can always log in.
  try {
    const Admin = require("./models/Admin");
    const bcrypt = require("bcryptjs");

    const username = process.env.SUPER_ADMIN_USERNAME || "main_admin";
    const email = process.env.SUPER_ADMIN_EMAIL || "siddhesh.s.contact@gmail.com";
    const password = process.env.SUPER_ADMIN_PASSWORD || "123";
    const existingSuperAdmin = await Admin.findOne({ username });

    if (!existingSuperAdmin) {
      const hashed = await bcrypt.hash(password, 10);
      await Admin.create({ username, email, password: hashed, role: "superadmin", isApproved: true });
      console.log("✅ Super admin created:", username);
    } else {
      const isPasswordMatch = await bcrypt.compare(password, existingSuperAdmin.password);

      if (!isPasswordMatch || existingSuperAdmin.role !== "superadmin" || !existingSuperAdmin.isApproved) {
        existingSuperAdmin.password = await bcrypt.hash(password, 10);
        existingSuperAdmin.role = "superadmin";
        existingSuperAdmin.isApproved = true;
        if (!existingSuperAdmin.email) existingSuperAdmin.email = email;
        await existingSuperAdmin.save();
        console.log("✅ Super admin credentials synchronized:", username);
      }
    }
  } catch (err) {
    console.error("Error during superadmin initialization:", err);
  }

  // mount API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/complaints", complaintRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/chat", chatRoutes);

  // Always return JSON for unknown API routes
  app.use("/api", (req, res) => {
    res.status(404).json({
      error: `API route not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Root health check (useful for Render health monitoring)
  app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Road Complaint System API is running" });
  });

  // Centralized JSON error handler
  app.use((err, req, res, next) => {
    console.error("Server error:", err);
    return res.status(err.status || 500).json({
      error: err.message || "Internal server error"
    });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
