const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["superadmin", "admin"],
    default: "admin"
  },
  state: { type: String },
  district: { type: String },
  taluka: { type: String },
  isApproved: { type: Boolean, default: false },
  otpSecret: String
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);
