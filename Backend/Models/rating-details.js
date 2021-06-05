const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  fiveStar: {
    type: Array,
  },
  fourStar: {
    type: Array,
  },
  threeStar: {
    type: Array,
  },
  twoStar: {
    type: Array,
  },
  oneStar: {
    type: Array,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ratingdetails", ratingSchema);
