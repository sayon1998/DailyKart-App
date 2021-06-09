const mongoose = require("mongoose");

const deliveryChargeSchema = new mongoose.Schema({
  minDeliveryAmt: {
    type: String,
    required: true,
  },
  chargeAmt: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Delivery-Charge", deliveryChargeSchema);
