const express = require("express");
const multer = require("multer");
const nodePath = require("path");
const fs = require("fs");
const Complaint = require("../models/Complaint");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

const cloudinary = require("../config/cloudinary");
const crypto = require('crypto');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ensure uploads directory exists
const uploadDir = nodePath.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const upload = multer({ storage });

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ─── AI Auto-Tagging Endpoint ────────────────────────────────────────────────
router.post("/analyze-image", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided for analysis." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "AI service is currently unavailable." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert multer buffer to Gemini inlineData format
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype
      }
    };

    const prompt = `
      Analyze this image of a road or infrastructure issue.
      Identify the type of issue (e.g., Pothole, Waterlogging, Broken road, Fallen tree, Garbage).
      Return a STRICT JSON response (do not use markdown formatting like \`\`\`json) with these two keys:
      1. "description": A short, clear 1-2 sentence description of the issue.
      2. "severity": Must be exactly one of these strings based on visual danger: "Low", "Medium", "High", or "Critical".
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText);
      return res.status(500).json({ error: "Failed to process AI response." });
    }

    res.json({
      success: true,
      description: analysis.description || "",
      severity: analysis.severity || "Medium"
    });

  } catch (err) {
    console.error("AI Analysis Error:", err);
    res.status(500).json({ error: "Image analysis failed." });
  }
});

// Upload a new complaint
router.post("/upload", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { location, state, district, taluka, latitude, longitude, lat, lng, path, routePath, description, severity } = req.body;
    const userId = req.user.id;
    let parsedPath = [];
    let parsedRoutePath = [];

    if (typeof path === 'string') {
      try {
        const candidate = JSON.parse(path);
        if (Array.isArray(candidate)) {
          parsedPath = candidate
            .map((point) => ({
              lat: Number(point?.lat),
              lng: Number(point?.lng)
            }))
            .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
        }
      } catch (parseError) {
        parsedPath = [];
      }
    }

    // Parse the actual road route path from OSRM
    if (typeof routePath === 'string') {
      try {
        const candidate = JSON.parse(routePath);
        if (Array.isArray(candidate)) {
          parsedRoutePath = candidate
            .map((point) => ({
              lat: Number(point?.lat),
              lng: Number(point?.lng)
            }))
            .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
        }
      } catch (parseError) {
        parsedRoutePath = [];
      }
    }

    const firstPathPoint = parsedPath[0];
    const parsedLat = parseFloat(firstPathPoint?.lat ?? lat ?? latitude);
    const parsedLng = parseFloat(firstPathPoint?.lng ?? lng ?? longitude);
    const hasCoordinates = !isNaN(parsedLat) && !isNaN(parsedLng);

    let flags = [];

    const recent = await Complaint.countDocuments({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
    });

    if (recent >= 5) flags.push("Suspicious");

    // only try distance check if we have valid coordinates
    if (hasCoordinates) {
      const complaints = await Complaint.find({
        $or: [
          { lat: { $ne: null }, lng: { $ne: null } },
          { latitude: { $ne: null }, longitude: { $ne: null } }
        ]
      });

      for (let c of complaints) {
        const complaintLat = typeof c.lat === 'number' ? c.lat : c.latitude;
        const complaintLng = typeof c.lng === 'number' ? c.lng : c.longitude;

        if (typeof complaintLat !== 'number' || typeof complaintLng !== 'number') {
          continue;
        }

        const dist = haversine(parsedLat, parsedLng, complaintLat, complaintLng);
        if (dist <= 100) {
          flags.push("Duplicate Area Alert");
          break;
        }
      }
    }

    let imageUrl = null;
    
    if (req.file) {
      try {
        if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key_here') {
          throw new Error("Cloudinary not configured");
        }
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { 
              folder: "road_complaints",
              resource_type: "auto"
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        imageUrl = uploadResult.secure_url;
      } catch (cloudinaryError) {
        console.warn("Cloudinary upload failed or not configured, falling back to local storage:", cloudinaryError.message);
        
        // Local Fallback
        const ext = nodePath.extname(req.file.originalname) || '.jpg';
        const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
        const filepath = nodePath.join(__dirname, '../uploads', filename);
        fs.writeFileSync(filepath, req.file.buffer);
        imageUrl = filename; // The frontend currently relies on serverBase/uploads/filename
      }
    }

    const complaint = await Complaint.create({
      user: userId,
      image: imageUrl,
      location,
      state,
      district,
      taluka,
      description,
      severity: severity || "Medium",
      path: parsedPath,
      routePath: parsedRoutePath,
      lat: hasCoordinates ? parsedLat : undefined,
      lng: hasCoordinates ? parsedLng : undefined,
      latitude: hasCoordinates ? parsedLat : undefined,
      longitude: hasCoordinates ? parsedLng : undefined,
      flags: flags.length > 0 ? flags.join("; ") : ""
    });

    await complaint.populate("user", "name email mobile village");

    res.json({
      message: "Complaint submitted successfully",
      complaint
    });
  } catch (err) {
    console.error("🔥 UPLOAD CRASH DETAILS:", err);
    res.status(400).json({ error: `Upload failed: ${err.message}` });
  }
});

// Get all complaints for current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status, location } = req.query;
    const userId = req.user.id;

    let query = { user: userId };

    if (status) {
      query.status = status;
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    const complaints = await Complaint.find(query)
      .populate("user", "name email mobile village")
      .sort({ createdAt: -1 });

    res.json({ complaints });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch complaints" });
  }
});

// Get complaint by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("user");

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Check if user owns this complaint
    if (complaint.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({ complaint });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch complaint" });
  }
});

// Update complaint
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { status, location, description } = req.body;

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Check if user owns this complaint
    if (complaint.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (status) complaint.status = status;
    if (location) complaint.location = location;
    if (description) complaint.description = description;

    await complaint.save();
    await complaint.populate("user", "name email mobile village");

    res.json({
      message: "Complaint updated successfully",
      complaint
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Update failed" });
  }
});

module.exports = router;
