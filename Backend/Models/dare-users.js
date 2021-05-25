const mongoose = require("mongoose");

const dareUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  displayname: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  encyptduser: {
    type: String,
    required: true,
  },
  userpin: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
  },
  latitude: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("dare-user-details", dareUserSchema);
