const mongoose = require("mongoose");

const deliverypinSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  pin: {
    type: Array,
  },
  deliveryEverywhere: false,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DeliveryPinDetails", deliverypinSchema);
