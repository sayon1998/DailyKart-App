const router = require("express").Router();

const addressDetails = require("../Models/address");
const userDetails = require("../Models/user-details");
const productDetail = require("../Models/product-details");
const orderDetail = require("../Models/order-details");
const cartDetail = require("../Models/cart-wishlist");

// Save Order
router.post("/save-orders", async (req, res) => {
  const resType = {
    status: false,
    data: [],
    message: "",
  };
  let orderArray = {
    orderDetail: [],
    totalorderPrice: "",
    totaloriginalPrice: "",
    totalofferPercentage: "",
  };
  let flag = false;
  try {
    if (!req.body.userId) {
      resType.message = "User Id is Required";
      return res.status(404).send(resType);
    }
    if (!req.body.deliveryaddress) {
      resType.message = "Delivery address is Required";
      return res.status(404).send(resType);
    }
    if (req.body.totalOfferPrice === null || req.body.totalOfferPrice === "") {
      resType.message = "Total offer price is Required";
      return res.status(404).send(resType);
    }
    if (
      req.body.totalOfferPercentage === null ||
      req.body.totalOfferPercentage === ""
    ) {
      resType.message = "Total offer percentage is Required";
      return res.status(404).send(resType);
    }
    if (
      req.body.totalOriginalPrice === null ||
      req.body.totalOriginalPrice === ""
    ) {
      resType.message = "Total original price is Required";
      return res.status(404).send(resType);
    }
    if (req.body.orderDetails && req.body.productDetails.length === 0) {
      resType.message = "Product details is Required";
      return res.status(404).send(resType);
    }
    await userDetails.findById(req.body.userId, async (err, params) => {
      if (err) {
        resType.message = err.message;
        return res.status(400).send(resType);
      }
      if (params === null) {
        resType.message = "User is not present in our databse";
        return res.status(404).send(resType);
      }
      //   Product is Available or not
      for (const index in req.body.productDetails) {
        let product = await productDetail.findById(
          req.body.productDetails[index]._id
        );
        if (product === null) {
          flag = true;
          resType.message =
            req.body.productDetails[index].name +
            " is not present in our Database";
          break;
        }
        if (
          product.quantity > 0 &&
          product.quantity >= req.body.productDetails[index].orderqty
        ) {
          product.quantity =
            product.quantity - req.body.productDetails[index].orderqty;
          await product.save();
          orderArray.orderDetail.push({
            _id: req.body.productDetails[index]._id,
            name: req.body.productDetails[index].name,
            img: req.body.productDetails[index].img,
            imagelist: req.body.productDetails[index].imagelist,
            rating: req.body.productDetails[index].rating,
            returnpolicy: req.body.productDetails[index].returnpolicy,
            totalrating: req.body.productDetails[index].totalrating,
            type: req.body.productDetails[index].type,
            unit: req.body.productDetails[index].unit,
            price: req.body.productDetails[index].price,
            originalprice: req.body.productDetails[index].originalprice,
            offerpercentage: req.body.productDetails[index].offerpercentage,
          });
        } else {
          flag = true;
          resType.message =
            req.body.productDetails[index].name + " is out of stock recently";
          break;
        }
      }
      if (flag) {
        return res.status(200).send(resType);
      } else {
        //   save Order into OrderDetails
        await orderDetail.findOne(
          {
            userId: req.body.userId,
          },
          async (err, orderParam) => {
            if (err) {
              resType.message = err.message;
              return res.status(400).send(resType);
            }
            try {
              if (orderParam === null) {
                let address = await addressDetails.findOne({
                  userId: req.body.userId,
                });
                if (address === null) {
                  resType.message = "User have no save address";
                  return res.status(404).send(resType);
                }
                if (
                  address.address.findIndex(
                    (x) => x.addressId === req.body.deliveryaddress.addressId
                  ) > -1
                ) {
                  address.address.splice(
                    address.address.findIndex(
                      (x) => x.addressId === req.body.deliveryaddress.addressId
                    ),
                    1
                  );
                  address.address.splice(0, 0, req.body.deliveryaddress);
                  const cartDetails = await cartDetail.findOne({
                    userId: req.body.userId,
                  });
                  if (cartDetails !== null && cartDetails.cart) {
                    for (const index in req.body.productDetails) {
                      if (
                        cartDetails.cart.findIndex(
                          (x) => x === req.body.productDetails[index]._id
                        ) > -1
                      ) {
                        cartDetails.cart.splice(
                          cartDetails.cart.findIndex(
                            (x) => x === req.body.productDetails[index]._id
                          ),
                          1
                        );
                      }
                    }
                  }
                  await address.save();
                  orderArray.totalorderPrice = req.body.totalOfferPrice;
                  orderArray.totaloriginalPrice = req.body.totalOriginalPrice;
                  orderArray.totalofferPercentage =
                    req.body.totalOfferPercentage;
                  resType.data = await orderDetail.create({
                    userId: req.body.userId,
                    orderDetails: [orderArray],
                  });
                  await cartDetails.save();
                  resType.status = true;
                  resType.message = "Order placed successfully";
                  return res.status(200).send(resType);
                } else {
                  resType.message =
                    "User's select address is not available in our database";
                  return res.status(404).send(resType);
                }
              } else {
                //   User's recent Address move to Top
                let address = await addressDetails.findOne({
                  userId: req.body.userId,
                });
                if (address === null) {
                  resType.message = "User have no save address";
                  return res.status(404).send(resType);
                }
                if (
                  address.address.findIndex(
                    (x) => x.addressId === req.body.deliveryaddress.addressId
                  ) > -1
                ) {
                  address.address.splice(
                    address.address.findIndex(
                      (x) => x.addressId === req.body.deliveryaddress.addressId
                    ),
                    1
                  );
                  address.address.splice(0, 0, req.body.deliveryaddress);
                  const cartDetails = await cartDetail.findOne({
                    userId: req.body.userId,
                  });
                  if (cartDetails !== null && cartDetails.cart) {
                    for (const index in req.body.productDetails) {
                      if (
                        cartDetails.cart.findIndex(
                          (x) => x === req.body.productDetails[index]._id
                        ) > -1
                      ) {
                        cartDetails.cart.splice(
                          cartDetails.cart.findIndex(
                            (x) => x === req.body.productDetails[index]._id
                          ),
                          1
                        );
                      }
                    }
                  }
                  orderArray.totalorderPrice = req.body.totalOfferPrice;
                  orderArray.totaloriginalPrice = req.body.totalOriginalPrice;
                  orderArray.totalofferPercentage =
                    req.body.totalOfferPercentage;
                  orderParam.orderDetails.push(orderArray);
                  await address.save();
                  resType.data = await orderParam.save();
                  await cartDetails.save();
                  resType.status = true;
                  resType.message = "Order placed successfully";
                  return res.status(200).send(resType);
                } else {
                  resType.message =
                    "User's select address is not available in our database";
                  return res.status(404).send(resType);
                }
              }
            } catch (err) {
              resType.message = err.message;
              return res.status(400).send(resType);
            }
          }
        );
      }
    });
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Get Order Details by User Id
router.get("/get-order-details/:userId", async (req, res) => {
  const resType = {
    status: false,
    data: [],
    message: "",
  };
  try {
    if (!req.params.userId) {
      resType.message = "User Id is Required";
      return res.status(404).send(resType);
    }
    const userDetail = await userDetails.findById(req.params.userId);
    if (userDetail === null) {
      resType.message = "User is not present in our Database";
      return res.status(404).send(resType);
    }
    const orderDetails = await orderDetail.findOne({
      userId: req.params.userId,
    });
    if (orderDetails === null) {
      resType.message = "You have no order";
      return res.status(200).send(resType);
    }
    resType.message = "Successful";
    resType.data = orderDetails.orderDetails;
    resType.status = true;
    return res.status(200).send(resType);
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

module.exports = router;
