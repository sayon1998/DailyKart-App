const mongoose = require("mongoose");

const dareSchema = new mongoose.Schema({
  userid: { type: String, required: true },
  annonyUser: { type: Array },
  question_and_answer: { type: Array, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("dare-questions-with-users", dareSchema);
