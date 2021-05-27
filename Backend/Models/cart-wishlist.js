const mongoose = require("mongoose");

const cartWishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  cart: {
    type: Array,
  },
  wishlist: {
    type: Array,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Cart&Wishlist", cartWishlistSchema);
