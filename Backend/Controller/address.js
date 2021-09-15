const router = require("express").Router();
const axios = require("axios");

const addressDetails = require("../Models/address");
const userDetails = require("../Models/user-details");
const deliveryPin = require("../Models/delivery-pin");
const productDetail = require("../Models/product-details");

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
      req.body.address[0].addressId = 1;
      resType.data = await addressDetails.create({
        userId: req.body.userId,
        address: req.body.address,
      });
      resType.message = "Address is successfully Saved";
      resType.status = true;
      return res.status(200).send(resType);
    } else {
      if (req.body.address && req.body.address[0].addressId === 0) {
        if (addressData.address && addressData.address.length > 0) {
          req.body.address[0].addressId = addressData.address.length + 1;
          addressData.address.splice(0, 0, req.body.address[0]);
          (addressData.address[1].isRecentlyUsed = false),
            await addressData.save();
        }
      } else if (req.body.address && req.body.address[0].addressId !== 0) {
        if (
          addressData.address &&
          addressData.address.findIndex(
            (x) => x.addressId === req.body.address[0].addressId
          ) > -1
        ) {
          addressData.address.splice(
            addressData.address.findIndex(
              (x) => x.addressId === req.body.address[0].addressId
            ),
            1,
            req.body.address[0]
          );
          await addressData.save();
        }
      }

      resType.data = addressData;
      resType.message = "Another Address is successfully Saved";
      resType.status = true;
      return res.status(200).send(resType);
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Delete User Address
router.delete("/delete-user-address/:userId/:addressId", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.params.userId) {
      resType.message = "User Id is Required";
      return res.status(404).send(resType);
    }
    if (!req.params.addressId) {
      resType.message = "Address Id is Required";
      return res.status(404).send(resType);
    }
    let addressData = await addressDetails.findOne({
      userId: req.params.userId,
    });
    if (addressData === null) {
      resType.message = "No Address is Available";
      return res.status(400).send(resType);
    }
    if (
      addressData.address &&
      addressData.address.findIndex(
        (x) => x.addressId === parseInt(req.params.addressId)
      ) > -1
    ) {
      addressData.address.splice(
        addressData.address.findIndex(
          (x) => x.addressId === parseInt(req.params.addressId)
        ),
        1
      );
      resType.data = await addressData.save();
      resType.status = true;
      resType.message = "Successful";
      return res.status(200).send(resType);
    } else {
      resType.message = "Address Details is not present in our Database";
      return res.status(404).send(resType);
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Get All Addresses of User
router.get("/get-all-address/:userId", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.params.userId) {
      resType.message = "User Id is Required";
      return res.status(404).send(resType);
    }
    const addressData = await addressDetails.findOne({
      userId: req.params.userId,
    });
    if (addressData === null) {
      resType.status = true;
      resType.message = "No Address is Available";
      return res.status(200).send(resType);
    }
    resType.data = addressData.address;
    resType.status = true;
    resType.message = "Successful";
    return res.status(200).send(resType);
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Get 1st Address from a User's Address Table
router.get("/get-address/:userId", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  if (!req.params.userId) {
    resType.message = "User Id is required.";
    return res.status(404).send(resType);
  }
  try {
    const addressData = await addressDetails.findOne({
      userId: req.params.userId,
    });
    if (addressData === null) {
      resType.message = "User have no address";
      return res.status(404).send(resType);
    }
    resType.data = addressData.address[0];
    resType.status = true;
    return res.status(200).send(resType);
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
          // console.log(
          //   response.data.postalCodes[0].placeName +
          //     "," +
          //     response.data.postalCodes[0].adminName2 +
          //     "," +
          //     response.data.postalCodes[0].adminName1 +
          //     "," +
          //     response.data.postalCodes[0].postalCode
          // );
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
          resType.message =
            "Order is not deliveriable at " + req.params.pin + ".";
          return res.status(200).send(resType);
        }
        if (!params.deliveryEverywhere) {
          let flag = false;
          for (const index in params.pin) {
            if (String(params.pin[index]) === String(req.params.pin)) {
              flag = true;
              break;
            }
          }
          if (flag) {
            resType.message = "Order is deliveriable";
            resType.status = true;
            return res.status(200).send(resType);
          } else {
            resType.message =
              "Order is not deliveriable at " + req.params.pin + ".";
            return res.status(200).send(resType);
          }
        } else {
          resType.message = "Order is deliveriable.";
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

// Check Multiple Order is Available or not in this Address
router.post("/check-multiple-order-deliveriable", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.body.pin) {
      resType.message = "Pin is Required";
      return res.status(400).send(resType);
    }
    if (req.body.productId && req.body.productId.length === 0) {
      resType.message = "Product Id is Required";
      return res.status(400).send(resType);
    }
    let productResponse = [];
    for (const index in req.body.productId) {
      const deliveryDetails = await deliveryPin.findOne({
        productId: req.body.productId[index],
      });
      const productDetails = await productDetail.findById(
        req.body.productId[index]
      );
      if (productDetails === null || deliveryDetails === null) {
        productResponse.push({
          productId: req.body.productId[index],
          status: true,
          message: "Not Deliveriable",
        });
      }
      if (
        productDetails.quantity > 0 &&
        deliveryDetails &&
        (deliveryDetails.pin.findIndex(
          (x) => String(x) === String(req.body.pin)
        ) > -1 ||
          deliveryDetails.deliveryEverywhere)
      ) {
        productResponse.push({
          productId: req.body.productId[index],
          status: false,
          message: "Deliveriable",
        });
      } else if (
        productDetails.quantity > 0 &&
        deliveryDetails &&
        (deliveryDetails.pin.findIndex(
          (x) => String(x) === String(req.body.pin)
        ) === -1 ||
          !deliveryDetails.deliveryEverywhere)
      ) {
        productResponse.push({
          productId: req.body.productId[index],
          status: true,
          message: `Currently out of stock for ${req.body.pin}`,
        });
      }
    }
    resType.data = productResponse;
    resType.message = "Successful";
    resType.status = true;
    return res.status(200).send(resType);
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Get State City Place using Pincode
router.get("/get-state-city-place/:pin", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  if (!req.params.pin) {
    resType.message = "Please enter pin";
    return res.status(404).send(resType);
  }
  try {
    axios
      .get(
        `http://api.geonames.org/postalCodeSearchJSON?formatted=true&postalcode=${req.params.pin}&maxRows=100&username=sayon&style=full`
      )
      .then(async function (response) {
        // handle success
        try {
          if (
            response.data.postalCodes &&
            response.data.postalCodes.length > 0
          ) {
            console.log(
              response.data.postalCodes[0].placeName +
                "," +
                response.data.postalCodes[0].adminName2 +
                "," +
                response.data.postalCodes[0].adminName1 +
                "," +
                response.data.postalCodes[0].postalCode
            );
            let city = [];
            for (const index in response.data.postalCodes) {
              city.push(response.data.postalCodes[index].placeName);
            }
            resType.data = {
              city,
              ps: response.data.postalCodes[0].adminName3,
              dist: response.data.postalCodes[0].adminName2,
              state: response.data.postalCodes[0].adminName1,
              pin: response.data.postalCodes[0].postalCode,
            };
            resType.status = true;
            resType.message = "Successful";
            return res.status(200).send(resType);
          } else {
            resType.message = "No address is found to this pin code";
            return res.status(404).send(resType);
          }
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

// Address Recently Used
router.post("/address-recently-used", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  if (!req.body.addressId) {
    resType.message = "Address Id is required.";
    return res.status(404).send(resType);
  }
  if (!req.body.userId) {
    resType.message = "User Id is required.";
    return res.status(404).send(resType);
  }
  try {
    const userData = await userDetails.findById(req.body.userId);
    if (userData === null) {
      resType.message = "userid is not present in our database";
      return res.status(404).send(resType);
    }
    const addressData = await addressDetails.findOne({
      userId: req.body.userId,
    });
    if (addressData === null) {
      resType.message = "No address is available";
      return res.status(404).send(resType);
    }
    if (
      addressData.address.findIndex((x) => x.addressId === req.body.addressId) >
      -1
    ) {
      let tempData =
        addressData.address[
          addressData.address.findIndex(
            (x) => x.addressId === req.body.addressId
          )
        ];
      addressData.address.splice(
        addressData.address.findIndex(
          (x) => x.addressId === req.body.addressId
        ),
        1
      );
      addressData.address.splice(0, 0, tempData);
      let tempAdd = [];
      addressData.address.forEach((e) => {
        if (e.addressId === req.body.addressId) {
          e.isRecentlyUsed = true;
        } else {
          e.isRecentlyUsed = false;
        }
        tempAdd.push(e);
      });
      addressData.address = tempAdd;
      resType.data = await addressData.save();
      resType.message = "Successful";
      resType.status = true;
      return res.status(200).send(resType);
    } else {
      resType.message = "Address is not available";
      return res.status(400).send(resType);
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

module.exports = router;
