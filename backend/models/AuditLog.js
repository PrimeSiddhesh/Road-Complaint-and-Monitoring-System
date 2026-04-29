const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
  actor: String,
  action: String,
  target: String
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditSchema);
