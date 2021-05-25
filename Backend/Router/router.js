const express = require("express");
const app = express();

// Route to Controller
const exportRoute = app.use("/auth", require("../Controller/authentication"));

module.exports = exportRoute;
