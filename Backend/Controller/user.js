const router = require("express").Router();
const userDetail = require("../Models/user-details");
const cartWishlistDetails = require("../Models/cart-wishlist");

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
      resType.status = true;
      resType.message = "Successful";
      const cartWishlist = await cartWishlistDetails.findOne({
        userId: user._id,
      });
      if (!cartWishlist) {
        return res.status(200).send(resType);
      } else {
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
        return res.status(200).send(resType);
      }
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

module.exports = router;
