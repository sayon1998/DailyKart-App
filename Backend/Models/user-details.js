const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fName: {
    type: String,
    required: true,
  },
  mName: {
    type: String,
  },
  lName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  ph: {
    type: String,
    required: true,
    maxlength: 10,
    minlength: 10,
  },
  recentlySearchDetails: { type: Array },
  recentlySeeProductDetails: { type: Array },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserDetails", userSchema);
