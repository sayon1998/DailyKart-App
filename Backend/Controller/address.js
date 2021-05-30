const router = require("express").Router();
const axios = require("axios");

const addressDetails = require("../Models/address");
const userDetails = require("../Models/user-details");
const deliveryPin = require("../Models/delivery-pin");

// Save User Address
router.post("/save-address", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.body.userId) {
      resType.message = "userid is Required";
      return res.status(404).send(resType);
    }
    if (req.body.address && req.body.address.length === 0) {
      resType.message = "Address is Required";
      return res.status(404).send(resType);
    }
    const userData = await userDetails.findById(req.body.userId);
    if (userData === null) {
      resType.message = "userid is not present in our database";
      return res.status(404).send(resType);
    }
    const addressData = await addressDetails.findOne({
      userId: req.body.userId,
    });
    if (addressData === null) {
      resType.data = await addressDetails.create({
        userId: req.body.userId,
        address: req.body.address,
      });
      resType.message = "Address is successfully Saved";
      resType.status = true;
      return res.status(200).send(resType);
    } else {
      addressData.address.push(req.body.address);
      resType.data = await addressData.save();
      resType.message = "Another Address is successfully Saved";
      resType.status = true;
      return res.status(200).send(resType);
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

//Get Address By (current location)
router.get("/get-current-location/:lat/:lon", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.params.lat) {
      resType.message = "Latitude is Required";
      return res.status(404).send(resType);
    }
    if (!req.params.lon) {
      resType.message = "Longitude is Required";
      return res.status(404).send(resType);
    }
    axios
      .get(
        `http://api.geonames.org/findNearbyPostalCodesJSON?lat=${req.params.lat}&lng=${req.params.lon}&username=sayon`
      )
      .then(async function (response) {
        // handle success
        try {
          console.log(
            response.data.postalCodes[0].placeName +
              "," +
              response.data.postalCodes[0].adminName2 +
              "," +
              response.data.postalCodes[0].adminName1 +
              "," +
              response.data.postalCodes[0].postalCode
          );
          resType.data = {
            city: response.data.postalCodes[0].placeName,
            dist: response.data.postalCodes[0].adminName2,
            state: response.data.postalCodes[0].adminName1,
            pin: response.data.postalCodes[0].postalCode,
            address:
              response.data.postalCodes[0].placeName +
              "," +
              response.data.postalCodes[0].adminName2 +
              "," +
              response.data.postalCodes[0].adminName1 +
              "," +
              response.data.postalCodes[0].postalCode,
          };
          resType.status = true;
          resType.message = "Successful";
          return res.status(200).send(resType);
        } catch (err) {
          resType.message = err.message;
          return res.status(404).send(resType);
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Add Order Deliverable Pin
router.post("/add-order-delivery-pin", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.body.productId) {
      resType.message = "Product Id is Required";
      return res.status(404).send(resType);
    }
    if (
      req.body.deliveryEverywhere === false &&
      req.body.pin &&
      req.body.pin.length === 0
    ) {
      resType.message =
        "Either Delivery Everywhere would be True or Enter exact pin address";
      return res.status(404).send(resType);
    }
    let deliveryPinDetails = await deliveryPin.findOne({
      productId: req.body.productId,
    });
    if (deliveryPinDetails === null) {
      resType.data = await deliveryPin.create({
        productId: req.body.productId,
        pin: req.body.pin,
        deliveryEverywhere: req.body.deliveryEverywhere,
      });
      resType.message = "Successful";
      resType.status = true;
      return res.status(200).send(resType);
    } else {
      if (req.body.deliveryEverywhere) {
        deliveryPinDetails.deliveryEverywhere = req.body.deliveryEverywhere;
        resType.data = await deliveryPinDetails.save();
        resType.message = "Successful";
        resType.status = true;
        return res.status(200).send(resType);
      } else {
        req.body.pin.forEach((x) => {
          if (deliveryPinDetails.pin.findIndex((e) => e === x) === -1) {
            deliveryPinDetails.pin.push(x);
          }
        });
        deliveryPinDetails.deliveryEverywhere = req.body.deliveryEverywhere;
        resType.data = await deliveryPinDetails.save();
        resType.message = "Successful";
        resType.status = true;
        return res.status(200).send(resType);
      }
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Delete Order Deliverable Particular Pin or Bunch of Pin
router.post("/delete-order-delivery-pin", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.body.productId) {
      resType.message = "Product Id is Required";
      return res.status(404).send(resType);
    }
    if (req.body.pin && req.body.pin.length === 0) {
      resType.message = "Enter exact pin address";
      return res.status(404).send(resType);
    }
    let deliveryPinDetails = await deliveryPin.findOne({
      productId: req.body.productId,
    });
    if (deliveryPinDetails === null) {
      resType.message = "No pin is available for this particular product";
      return res.status(404).send(resType);
    } else {
      req.body.pin.forEach((x) => {
        if (deliveryPinDetails.pin.findIndex((e) => e === x) > -1) {
          deliveryPinDetails.pin.splice(
            deliveryPinDetails.pin.findIndex((e) => e === x),
            1
          );
        }
      });
      resType.data = await deliveryPinDetails.save();
      resType.message = "Successful";
      resType.status = true;
      return res.status(200).send(resType);
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Check Order is Available or not in this address
router.get("/address-deliveriable/:pin/:productId", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.params.pin) {
      resType.message = "Pin is required";
      return res.status(404).send(resType);
    }
    if (!req.params.productId) {
      resType.message = "product Id is required";
      return res.status(404).send(resType);
    }
    await deliveryPin.findOne(
      { productId: req.params.productId },
      async (err, params) => {
        if (err) {
          resType.message = err.message;
          return res.status(400).send(resType);
        }
        if (params === null) {
          resType.message = "Order is not deliveriable to this pin code";
          return res.status(200).send(resType);
        }
        if (!params.deliveryEverywhere) {
          let flag = false;
          for (const index in params.pin) {
            if (params.pin[index] === req.params.pin) {
              flag = true;
              break;
            }
          }
          if (flag) {
            resType.message = "Order is deliveriable";
            resType.status = true;
            return res.status(200).send(resType);
          } else {
            resType.message = "Order is not deliveriable to this pin code";
            return res.status(200).send(resType);
          }
        } else {
          resType.message = "Order is deliveriable";
          resType.status = true;
          return res.status(200).send(resType);
        }
      }
    );
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

module.exports = router;
