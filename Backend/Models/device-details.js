const mongoose = require("mongoose");

const deviceDetailsSchema = new mongoose.Schema({
  userid: { type: String },
  msgid: { type: String },
  browser: { type: String },
  browser_version: { type: String },
  device: { type: String },
  deviceType: { type: String },
  orientation: { type: String },
  os: { type: String },
  os_version: { type: String },
  userAgent: { type: String },
  ip: { type: String },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("device-details", deviceDetailsSchema);
