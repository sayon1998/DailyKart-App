const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotEnv = require("dotenv");
const port = process.env.PORT || 3000;
const path = require("path");
const fileUpload = require("express-fileupload");
var cors = require("cors");
const bodyParser = require("body-parser");

// Routes
const allPostRoute = require("./Routers/post");
const allGetRoute = require("./Routers/get");
const allDeleteRoute = require("./Routers/delete");
const scheduler = require("./Scheduler/push-notification");

//Environment Setup
dotEnv.config();

//Get Image Path
app.use("/images/:assest/:imagename", (req, res) => {
  return res.sendFile(
    path.join(__dirname + `/assests/${req.params.imagename}`)
  );
});

// Connect Mongoose
mongoose.connect(
  process.env.DB_CONNECT,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("Connected to MongoDB")
);

// Middleware
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});

// Router Middleware
app.use("/api", allPostRoute);
app.use("/api", allGetRoute);
app.use("/api", allDeleteRoute);
app.use("/scheduler", scheduler);

app.listen(port, function () {
  console.log("Server is running on port " + port);
});
