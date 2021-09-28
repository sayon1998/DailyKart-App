const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Product Name
  },
  description: {
    type: String,
    required: true, // Product Description
  },
  unit: {
    type: String,
    required: true, // '1kg'
  },
  perunit: {
    type: String,
    required: true, // Only Unit like 'kg'
  },
  quantity: {
    type: Number,
    required: true, // Total Quantity for this product Available in our Database
  },
  orderqty: {
    type: Number,
    required: true, // User is currently Order
  },
  minqty: {
    type: Number,
    required: true, // Minimum quantity user should be order
  },
  highestquentity: {
    type: Number,
    required: true, // Highest Quantity user should be order
  },
  price: {
    type: Number,
    required: true, // Current Price or Offer Price
  },
  originalprice: {
    type: Number,
    required: true, // Actual Price
  },
  offerpercentage: {
    type: Number,
    required: true, // Offer as a percentage
  },
  img: {
    type: String,
    required: true, // Main Image
  },
  imagelist: {
    type: Array, // Rest of the images
  },
  type: {
    type: String,
    required: true, // Which type of product it is (Category)
  },
  returnpolicy: {
    type: String, // What is the return policy
  },
  companyid: {
    type: String,
    required: true, // Company name or shop name
  },
  company: {
    type: String,
    required: true, // Company name or shop name
  },
  rating: {
    type: String, // Current Rating out of 5
  },
  totalrating: {
    type: String, // How many users rate this product
  },
  icon: {
    type: String,
    required: true, // Wishlist icon
  },
  deliverycharge: {
    type: Number, // Delivery Charge
  },
  paymentmode: {
    type: String,
    required: true, // Payment Mode online or offline
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ProductDetails", productSchema);
