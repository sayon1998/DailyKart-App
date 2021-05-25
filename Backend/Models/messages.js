const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  userid: { type: String, required: true },
  messagedetails: { type: Array, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("messages", messageSchema);
