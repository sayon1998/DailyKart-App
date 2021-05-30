const express = require("express");
const app = express();

// Route to Controller
app.use("/auth", require("../Controller/authentication"));
app.use("/product", require("../Controller/product"));
app.use("/address", require("../Controller/address"));

module.exports = app;
