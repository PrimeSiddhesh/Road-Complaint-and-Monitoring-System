const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { sendAdminStatusEmail } = require("../config/email");

const router = express.Router();

// Middleware to check admin authentication
const adminAuthMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Utility route to create a new admin account.
router.post("/create-admin", async (req, res) => {
  try {
    const { username = "main_admin", email = "siddhesh.s.contact@gmail.com", password = "123" } = req.body;

    // if admins already exist, enforce authentication
    const count = await Admin.countDocuments();
    if (count > 0) {
      const authHeader = req.header("Authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "No token provided" });
      try {
        jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
      } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
      }
    }

    const existing = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ error: "Admin already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    // Bootstrap as superadmin
    const admin = await Admin.create({ 
      username, 
      email,
      password: hashed,
      role: count === 0 ? "superadmin" : "admin",
      isApproved: true
    });
    res.json({ message: "Admin created", admin });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Creation failed" });
  }
});

// Register a new admin (Taluka Admin)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, state, district, taluka } = req.body;

    const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin username or email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ 
      username,
      email, 
      password: hashed,
      role: "admin",
      state,
      district,
      taluka,
      isApproved: false // Requires superadmin approval
    });

    res.json({
      message: "Admin registered successfully. Please wait for Super Admin approval before logging in.",
      admin: { _id: admin._id, username: admin.username, role: admin.role, taluka: admin.taluka }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Admin registration failed" });
  }
});

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ $or: [{ username }, { email: username }] });
    if (!admin) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (admin.role === "admin" && !admin.isApproved) {
      return res.status(403).json({ error: "Your account is pending approval by the Super Admin." });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role, taluka: admin.taluka }, 
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    res.json({
      message: "Admin logged in successfully",
      token,
      admin: { _id: admin._id, username: admin.username, role: admin.role, taluka: admin.taluka }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Login failed" });
  }
});

// Get all complaints (admin only)
router.get("/complaints", adminAuthMiddleware, async (req, res) => {
  try {
    const { status, location, taluka, page = 1, limit = 10 } = req.query;

    let query = {};

    // If Taluka Admin, restrict to their taluka
    if (req.admin.role === "admin" && req.admin.taluka) {
      query.taluka = req.admin.taluka;
    } else if (taluka) {
      // If Super Admin searches by taluka
      query.taluka = taluka;
    }

    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: "i" };

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(query)
      .populate("user", "name email mobile village")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch complaints" });
  }
});

// Get complaint details (admin only)
router.get("/complaints/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("user");

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json({ complaint });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch complaint" });
  }
});

// Update complaint status (admin only)
router.put("/complaints/:id/status", adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user");

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json({
      message: "Complaint status updated successfully",
      complaint
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Update failed" });
  }
});

// Delete a complaint (admin only)
router.delete("/complaints/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Delete failed" });
  }
});

// Get admin dashboard statistics
router.get("/stats", adminAuthMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.admin.role === "admin" && req.admin.taluka) {
      query.taluka = req.admin.taluka;
    }

    const totalComplaints = await Complaint.countDocuments(query);
    const pendingComplaints = await Complaint.countDocuments({ ...query, status: "Pending" });
    const inProgressComplaints = await Complaint.countDocuments({ ...query, status: "In Progress" });
    const resolvedComplaints = await Complaint.countDocuments({ ...query, status: "Resolved" });
    
    // Total users is global, but could be filtered if we mapped users to talukas
    const totalUsers = await User.countDocuments();

    res.json({
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      totalUsers
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch statistics" });
  }
});

// Get all admin users (admin only)
router.get("/admins", adminAuthMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmin can view all admins" });
    }
    const admins = await Admin.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json({ admins });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch admins" });
  }
});

// Get pending admins (superadmin only)
router.get("/pending-admins", adminAuthMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== "superadmin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const pending = await Admin.find({ role: "admin", isApproved: false }, { password: 0 }).sort({ createdAt: -1 });
    res.json({ admins: pending });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch pending admins" });
  }
});

// Approve admin (superadmin only)
router.put("/approve/:id", adminAuthMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== "superadmin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const admin = await Admin.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true, select: "-password" });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    
    // Send approval email
    try {
      await sendAdminStatusEmail({ toEmail: admin.email, status: 'approved', taluka: admin.taluka });
    } catch (e) {
      console.error("Failed to send approval email", e);
    }
    
    res.json({ message: "Admin approved successfully", admin });
  } catch (err) {
    res.status(400).json({ error: "Failed to approve admin" });
  }
});

// Decline admin (superadmin only)
router.delete("/decline/:id", adminAuthMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== "superadmin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    // Send decline email
    try {
      await sendAdminStatusEmail({ toEmail: admin.email, status: 'declined', taluka: admin.taluka });
    } catch (e) {
      console.error("Failed to send decline email", e);
    }

    res.json({ message: "Admin declined and removed successfully" });
  } catch (err) {
    res.status(400).json({ error: "Failed to decline admin" });
  }
});

// Get current admin's profile (admin only)
router.get("/profile", adminAuthMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id, { password: 0 });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.json({ admin });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch profile" });
  }
});

// Change admin password (admin only)
router.put("/change-password", adminAuthMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to change password" });
  }
});

// Delete an admin user (admin only)
router.delete("/admins/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.admin.id === id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Ensure at least one admin remains
    const adminCount = await Admin.countDocuments();
    if (adminCount <= 1) {
      return res.status(400).json({ error: "Cannot delete the only admin. At least one admin must exist." });
    }

    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to delete admin" });
  }
});

module.exports = router;
