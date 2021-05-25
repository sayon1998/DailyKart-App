const router = require("express").Router();
const loveCrushDetails = require("../Models/love-crush");
const dareDetails = require("../Models/dare-details");
router.delete("/delete-details/:_id/:type", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  if (!req.params._id) {
    resType["Message"] = "Id is Required";
    return res.status(400).send(resType);
  }
  if (!req.params.type) {
    resType["Message"] = "type is Required";
    return res.status(400).send(resType);
  }
  if (req.params.type === "love-crush") {
    await loveCrushDetails.findByIdAndDelete(req.params._id, (err, params) => {
      if (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      try {
        if (params && params != null) {
          resType["Message"] = "Successfuly Deleted";
          resType["Status"] = true;
          return res.status(200).send(resType);
        }
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
    });
  } else if (req.params.type === "dare-games") {
    await dareDetails.findByIdAndDelete(req.params._id, (err, params) => {
      if (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      try {
        if (params && params != null) {
          resType["Message"] = "Successfuly Deleted";
          resType["Status"] = true;
          return res.status(200).send(resType);
        }
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
    });
  }
});

module.exports = router;
