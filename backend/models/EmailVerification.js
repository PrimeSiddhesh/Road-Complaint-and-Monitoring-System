const mongoose = require("mongoose");

const emailVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  otpHash: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null },
  lastSentAt: { type: Date, default: null },
  windowStartedAt: { type: Date, default: null },
  requestCount: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-remove stale verification records.
emailVerificationSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("EmailVerification", emailVerificationSchema);
