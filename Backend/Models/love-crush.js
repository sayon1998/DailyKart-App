const mongoose = require("mongoose");

const loveCrushSchema = new mongoose.Schema({
  uname: { type: String, required: true },
  crushname: { type: String, required: true },
  percentage: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("love-crush", loveCrushSchema);
