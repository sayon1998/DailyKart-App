const mongoose = require("mongoose");

const sitemapDetailsSchema = new mongoose.Schema({
  sitemapfor: {
    type: String,
    required: true,
  },
  sitemap: {
    type: {},
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  store1: {
    type: String,
    required: true,
  },
  store2: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("sitemap-details", sitemapDetailsSchema);
