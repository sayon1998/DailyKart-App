const router = require("express").Router();
const userDetail = require("../Models/user-details");
const cartWishlistDetails = require("../Models/cart-wishlist");
const addressDetails = require("../Models/address");
const orderDetails = require("../Models/order-details");
const userDetails = require("../Models/user-details");

// User details by user id
router.get("/user-by-id/:_id", async (req, res) => {
  const resType = {
    status: false,
    data: {
      fName: "",
      mName: "",
      lName: "",
      ph: "",
      gender: "",
      email: "",
      cartLength: 0,
      wishLength: 0,
      addressLength: 0,
      orderLength: 0,
      recentlyUsedAddress: {},
      lastOrderDetails: {},
    },
    message: "",
  };
  if (!req.params._id) {
    resType.message = "User id is required.";
    return res.status(404).send(resType);
  }
  try {
    const user = await userDetail.findById(req.params._id);
    if (!user) {
      resType.message = "User is not present in our Database";
      return res.status(404).send(resType);
    } else {
      resType.data.fName = user.fName;
      resType.data.mName = user.mName;
      resType.data.lName = user.lName;
      resType.data.gender = user.gender;
      resType.data.email = user.email;
      resType.data.ph = user.ph;
      const cartWishlist = await cartWishlistDetails.findOne({
        userId: user._id,
      });
      if (cartWishlist) {
        resType.data.cartLength =
          cartWishlist && cartWishlist.cart && cartWishlist.cart.length > 0
            ? cartWishlist.cart.length
            : 0;
        resType.data.wishLength =
          cartWishlist &&
          cartWishlist.wishlist &&
          cartWishlist.wishlist.length > 0
            ? cartWishlist.wishlist.length
            : 0;
      }
      const addressDetail = await addressDetails.findOne({ userId: user._id });
      if (addressDetail) {
        resType.data.addressLength =
          addressDetail &&
          addressDetail.address &&
          addressDetail.address.length > 0
            ? addressDetail.address.length
            : 0;
        resType.data.recentlyUsedAddress =
          addressDetail &&
          addressDetail.address &&
          addressDetail.address.length > 0 &&
          addressDetail.address.findIndex((x) => x.isRecentlyUsed === true) > -1
            ? addressDetail.address[
                addressDetail.address.findIndex(
                  (x) => x.isRecentlyUsed === true
                )
              ]
            : {};
      }
      const orderDetail = await orderDetails.findOne({ userId: user._id });
      if (orderDetail) {
        resType.data.orderLength =
          orderDetail &&
          orderDetail.orderDetails &&
          orderDetail.orderDetails.length > 0
            ? orderDetail.orderDetails.length
            : 0;
        resType.data.lastOrderDetails =
          orderDetail &&
          orderDetail.orderDetails &&
          orderDetail.orderDetails.length > 0
            ? orderDetail.orderDetails[orderDetail.orderDetails.length - 1]
            : {};
      }
      resType.status = true;
      resType.message = "Successful";
      return res.status(200).send(resType);
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// User details update
router.post("/user-details-update", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  if (!req.body._id) {
    resType.message = "User id is Required.";
    return res.status(404).send(resType);
  }
  if (
    !req.body.fName &&
    !req.body.mName &&
    !req.body.lName &&
    !req.body.email &&
    !req.body.ph &&
    !req.body.gender
  ) {
    resType.message =
      "Atleast one item has to  be present to update user details.";
    return res.status(404).send(resType);
  }
  try {
    const userDetails = await userDetail.findById(req.body._id);
    if (userDetails === null) {
      resType.message = "User is not present in our Database";
      return res.status(404).send(resType);
    }
    userDetails.fName = req.body.fName;
    userDetails.mName = req.body.mName;
    userDetails.lName = req.body.lName;
    userDetails.email = req.body.email;
    userDetails.ph = req.body.ph;
    userDetails.gender = req.body.gender;
    resType.data = await userDetails.save();
    resType.status = true;
    resType.message = "Updated Successfully.";
    return res.status(200).send(resType);
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// User's password update
router.post("/user-password-update", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  if (!req.body._id) {
    resType.message = "User id is Required.";
    return res.status(404).send(resType);
  }
  if (!req.body.oldpass) {
    resType.message = "User's old password is Required";
    return res.status(404).send(resType);
  }
  if (!req.body.newpass) {
    resType.message = "User's new password is Required";
    return res.status(404).send(resType);
  }
  try {
    const userDetails = await userDetail.findById(req.body._id);
    if (userDetails === null) {
      resType.message = "User is not present in our Database";
      return res.status(404).send(resType);
    }
    if (userDetails.password !== req.body.oldpass) {
      resType.message = "Your old password is not matching";
      return res.status(200).send(resType);
    }
    userDetails.password = req.body.newpass;
    await userDetails.save();
    resType.status = true;
    resType.message = "Updated Successfully.";
    return res.status(200).send(resType);
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});
module.exports = router;
