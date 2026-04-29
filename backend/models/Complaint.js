const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: String,
  location: String,
  state: String,
  district: String,
  taluka: String,
  description: String,
  severity: { type: String, default: "Medium" },
  path: [
    {
      lat: Number,
      lng: Number
    }
  ],
  routePath: [
    {
      lat: Number,
      lng: Number
    }
  ],
  lat: Number,
  lng: Number,
  latitude: Number,
  longitude: Number,
  status: { type: String, default: "Pending" },
  flags: String
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
