const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  village: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
