const mongoose = require("mongoose");

const dareSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answers: { type: Array, required: true },
  available: { type: Boolean, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("dare-details", dareSchema);
