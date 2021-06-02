const mongoose = require("mongoose");

const orederSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  orderDetails: {
    type: Array,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("OrderDetails", orederSchema);
