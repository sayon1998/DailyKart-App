const router = require("express").Router();
const validate = require("validator");
const axios = require("axios");

const userDetails = require("../Models/user-details");
const cartWishlist = require("../Models/cart-wishlist");
const emailTemp = require("../Service/email-template");

// Signup and Signin
router.post("/sign-upin", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.body.reqType) {
      resType.message = "Request type is Required";
      return res.status(404).send(resType);
    }
    if (req.body.reqType === "signup") {
      if (!req.body.fName) {
        resType.message = "First Name is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.lName) {
        resType.message = "Last Name is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.password) {
        resType.message = "Password is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.gender) {
        resType.message = "Gender is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.email) {
        resType.message = "Email is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.ph) {
        resType.message = "Phone Number is Required";
        return res.status(404).send(resType);
      }
      if (!validate.isEmail(req.body.email)) {
        resType.message = "Email is not Valid";
        return res.status(400).send(resType);
      }
      await userDetails.findOne(
        { email: req.body.email },
        async (err, params) => {
          if (err) {
            resType.message = err.message;
            return res.status(404).send(resType);
          }
          if (params === null) {
            const saveData = await userDetails.create({
              fName: req.body.fName,
              mName: req.body.mName,
              lName: req.body.lName,
              gender: req.body.gender,
              email: req.body.email,
              ph: req.body.ph,
              password: req.body.password,
            });
            resType.data = {
              _id: saveData._id,
              fName: saveData.fName,
              mName: saveData.mName,
              lName: saveData.lName,
              gender: saveData.gender,
              email: saveData.email,
              ph: saveData.ph,
            };
            const emailParam = {
              fName: saveData.fName,
              mName: saveData.mName,
              lName: saveData.lName,
              senderMail: saveData.email,
              type: "registration",
              subject: "DailyKart Account Registration",
            };
            emailTemp.emailTemplate(emailParam);
            resType.status = true;
            resType.message = "Registration Successful";
            return res.status(200).send(resType);
          } else {
            resType.message = "Email is already present in our database";
            return res.status(400).send(resType);
          }
        }
      );
    } else if (req.body.reqType === "signin") {
      if (!req.body.email && !req.body.ph) {
        resType.message = "Please Enter Email or Phone";
        return res.status(404).send(resType);
      }
      if (!req.body.password) {
        resType.message = "Please Enter Password";
        return res.status(404).send(resType);
      }
      if (req.body.ph) {
        await userDetails.findOne({ ph: req.body.ph }, async (err, params) => {
          if (err) {
            resType.message = err.message;
            return res.status(404).send(resType);
          }
          if (params === null) {
            resType.message = "Phone number is not registered in Dailykart";
            return res.status(404).send(resType);
          }
          if (params.password === req.body.password) {
            // Get Location Information
            if (req.body.lat && req.body.lon) {
              axios
                .get(
                  `http://api.geonames.org/findNearbyPostalCodesJSON?lat=${req.body.lat}&lng=${req.body.lon}&username=sayon`
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
                    let emailParam = {
                      fName: params.fName,
                      mName: params.mName,
                      lName: params.lName,
                      senderMail: params.email,
                      address:
                        response.data.postalCodes[0].placeName +
                        "," +
                        response.data.postalCodes[0].adminName2 +
                        "," +
                        response.data.postalCodes[0].adminName1 +
                        "," +
                        response.data.postalCodes[0].postalCode,
                      type: "login-alert",
                      subject: "DailyKart Login Alert",
                    };
                    resType.data = {
                      fName: params.fName,
                      mName: params.mName,
                      lName: params.lName,
                      email: params.email,
                      ph: params.ph,
                      gender: params.gender,
                    };
                    emailTemp.emailTemplate(emailParam);
                    resType.status = true;
                    resType.message = "Login Successful";
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
            } else {
              try {
                await cartWishlist.findOne(
                  { userId: params._id },
                  async (err, cartWishParams) => {
                    if (err) {
                      resType.message = err.message;
                      return res.status(404).send(resType);
                    }
                    if (cartWishParams === null) {
                      resType.data = {
                        fName: params.fName,
                        mName: params.mName,
                        lName: params.lName,
                        email: params.email,
                        ph: params.ph,
                        gender: params.gender,
                        cart: [],
                        wishlist: [],
                      };
                    } else {
                      resType.data = {
                        fName: params.fName,
                        mName: params.mName,
                        lName: params.lName,
                        email: params.email,
                        ph: params.ph,
                        gender: params.gender,
                        cart: cartWishParams.cart,
                        wishlist: cartWishParams.wishlist,
                      };
                    }
                    resType.status = true;
                    resType.message = "Login Successful";
                    return res.status(200).send(resType);
                  }
                );
              } catch (err) {
                resType.message = err.message;
                return res.status(404).send(resType);
              }
            }
          } else {
            resType.message = "Please Enter Correct Password";
            return res.status(400).send(resType);
          }
        });
      } else if (req.body.email) {
        await userDetails.findOne(
          { email: req.body.email },
          async (err, params) => {
            if (err) {
              resType.message = err.message;
              return res.status(404).send(resType);
            }
            if (params === null) {
              resType.message = "Email is not registered in Dailykart";
              return res.status(404).send(resType);
            }
            if (params.password === req.body.password) {
              // Get Location Information
              if (req.body.lat && req.body.lon) {
                axios
                  .get(
                    `http://api.geonames.org/findNearbyPostalCodesJSON?lat=${req.body.lat}&lng=${req.body.lon}&username=sayon`
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
                      let emailParam = {
                        fName: params.fName,
                        mName: params.mName,
                        lName: params.lName,
                        senderMail: params.email,
                        address:
                          response.data.postalCodes[0].placeName +
                          "," +
                          response.data.postalCodes[0].adminName2 +
                          "," +
                          response.data.postalCodes[0].adminName1 +
                          "," +
                          response.data.postalCodes[0].postalCode,
                        type: "login-alert",
                        subject: "DailyKart Login Alert",
                      };
                      await cartWishlist.findOne(
                        { userId: params._id },
                        async (err, cartWishParams) => {
                          if (err) {
                            resType.message = err.message;
                            return res.status(404).send(resType);
                          }
                          if (cartWishParams === null) {
                            resType.data = {
                              fName: params.fName,
                              mName: params.mName,
                              lName: params.lName,
                              email: params.email,
                              ph: params.ph,
                              gender: params.gender,
                              cart: [],
                              wishlist: [],
                            };
                          } else {
                            resType.data = {
                              fName: params.fName,
                              mName: params.mName,
                              lName: params.lName,
                              email: params.email,
                              ph: params.ph,
                              gender: params.gender,
                              cart: cartWishParams.cart,
                              wishlist: cartWishParams.wishlist,
                            };
                          }
                          emailTemp.emailTemplate(emailParam);
                          resType.status = true;
                          resType.message = "Login Successful";
                          return res.status(200).send(resType);
                        }
                      );
                    } catch (err) {
                      resType.message = err.message;
                      return res.status(404).send(resType);
                    }
                  })
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                  });
              } else {
                try {
                  await cartWishlist.findOne(
                    { userId: params._id },
                    async (err, cartWishParams) => {
                      if (err) {
                        resType.message = err.message;
                        return res.status(404).send(resType);
                      }
                      if (cartWishParams === null) {
                        resType.data = {
                          fName: params.fName,
                          mName: params.mName,
                          lName: params.lName,
                          email: params.email,
                          ph: params.ph,
                          gender: params.gender,
                          cart: [],
                          wishlist: [],
                        };
                      } else {
                        resType.data = {
                          fName: params.fName,
                          mName: params.mName,
                          lName: params.lName,
                          email: params.email,
                          ph: params.ph,
                          gender: params.gender,
                          cart: cartWishParams.cart,
                          wishlist: cartWishParams.wishlist,
                        };
                      }
                      resType.status = true;
                      resType.message = "Login Successful";
                      return res.status(200).send(resType);
                    }
                  );
                } catch (err) {
                  resType.message = err.message;
                  return res.status(404).send(resType);
                }
              }
            } else {
              resType.message = "Please Enter Correct Password";
              return res.status(400).send(resType);
            }
          }
        );
      }
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(404).send(resType);
  }
});

// Phone number is Present or not in Our Database
router.post("/check-phnumber-availability", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.body.ph) {
      resType.message = "Phone Number is Required";
      return res.status(404).send(resType);
    }
    if (!validate.isMobilePhone(req.body.ph)) {
      resType.message = "Phone Number is not Valid";
      return res.status(400).send(resType);
    }
    await userDetails.findOne({ ph: req.body.ph }, async (err, params) => {
      if (err) {
        resType.message = err.message;
        return res.status(400).send(resType);
      }
      if (params === null) {
        resType.status = true;
        resType.message = "Phone number is not present";
        return res.status(200).send(resType);
      } else {
        resType.message = "Phone number is already present";
        return res.status(400).send(resType);
      }
    });
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});
module.exports = router;
