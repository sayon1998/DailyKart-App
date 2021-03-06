const router = require("express").Router();

const addressDetails = require("../Models/address");
const userDetails = require("../Models/user-details");
const productDetail = require("../Models/product-details");
const orderDetail = require("../Models/order-details");
const cartDetail = require("../Models/cart-wishlist");
const rateDetail = require("../Models/rating-details");
const deliveryCharge = require("../Models/delivery-charge");

// Order Placed
router.post("/save-orders", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  let orderArray = {
    orderId: 0,
    orderDetail: [],
    addressDetail: {},
    totalorderPrice: "",
    totaloriginalPrice: "",
    totalofferPercentage: "",
  };
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
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
    if (req.body.productDetails && req.body.productDetails.length === 0) {
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
          product.quantity >= req.body.productDetails[index].qty
        ) {
          product.quantity =
            product.quantity - req.body.productDetails[index].qty;
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
            orderqty: req.body.productDetails[index].qty,
            deliverycharge: req.body.productDetails[index].deliverycharge,
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
                        await cartDetails.save();
                      }
                    }
                  }
                  await address.save();
                  orderArray.orderId =
                    orderParam &&
                    orderParam.orderDetails &&
                    orderParam.orderDetails.length > 0
                      ? "ODD" +
                        new Date().getMilliseconds() +
                        new Date().getSeconds() +
                        new Date().getDay() +
                        new Date().getMonth() +
                        new Date().getFullYear() +
                        String(orderParam.orderDetails.length + 1)
                      : "ODD" +
                        new Date().getMilliseconds() +
                        new Date().getSeconds() +
                        new Date().getDay() +
                        new Date().getMonth() +
                        new Date().getFullYear() +
                        String(1);
                  orderArray.addressDetail = req.body.deliveryaddress;
                  orderArray.totalorderPrice = req.body.totalOfferPrice;
                  orderArray.totalDeliveryCharge = req.body.deliveryCharge;
                  orderArray.totaloriginalPrice = req.body.totalOriginalPrice;
                  orderArray.totalofferPercentage =
                    req.body.totalOfferPercentage;
                  orderArray.deliveryCharge = req.body.deliveryCharge;
                  orderArray.paymentMethod = req.body.paymentMethod;
                  (orderArray.isOrderPlaced = true),
                    (orderArray.isOrderPacked = false),
                    (orderArray.isOrderDispatched = false),
                    (orderArray.isOrderOutForDelivery = false),
                    (orderArray.isOrderDelivered = false),
                    (orderArray.orderTime = today.toLocaleString("en-US", {
                      timeZone: "Asia/Kolkata",
                    }));
                  orderArray.deliveryTime = tomorrow.toLocaleString("en-US", {
                    timeZone: "Asia/Kolkata",
                  });
                  resType.data = await orderDetail.create({
                    userId: req.body.userId,
                    orderDetails: [orderArray],
                  });
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
                        await cartDetails.save();
                      }
                    }
                  }
                  orderArray.orderId =
                    orderParam &&
                    orderParam.orderDetails &&
                    orderParam.orderDetails.length > 0
                      ? "ODD" +
                        new Date().getMilliseconds() +
                        new Date().getSeconds() +
                        new Date().getDay() +
                        new Date().getMonth() +
                        new Date().getFullYear() +
                        String(orderParam.orderDetails.length + 1)
                      : "ODD" +
                        new Date().getMilliseconds() +
                        new Date().getSeconds() +
                        new Date().getDay() +
                        new Date().getMonth() +
                        new Date().getFullYear() +
                        String(1);
                  orderArray.addressDetail = req.body.deliveryaddress;
                  orderArray.totalorderPrice = req.body.totalOfferPrice;
                  orderArray.totalDeliveryCharge = req.body.deliveryCharge;
                  orderArray.totaloriginalPrice = req.body.totalOriginalPrice;
                  orderArray.totalofferPercentage =
                    req.body.totalOfferPercentage;
                  orderArray.deliveryCharge = req.body.deliveryCharge;
                  orderArray.paymentMethod = req.body.paymentMethod;
                  (orderArray.isOrderPlaced = true),
                    (orderArray.isOrderPacked = false),
                    (orderArray.isOrderDispatched = false),
                    (orderArray.isOrderOutForDelivery = false),
                    (orderArray.isOrderDelivered = false),
                    (orderArray.orderTime = today.toLocaleString("en-US", {
                      timeZone: "Asia/Kolkata",
                    }));
                  orderArray.deliveryTime = tomorrow.toLocaleString("en-US", {
                    timeZone: "Asia/Kolkata",
                  });
                  orderParam.orderDetails.push(orderArray);
                  await address.save();
                  resType.data = await orderParam.save();
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

// Order Placed v.2
router.post("/save-order-v2", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let flag = false,
    orderArray = [],
    product;
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
    if (req.body.productDetails && req.body.productDetails.length === 0) {
      resType.message = "Product details is Required";
      return res.status(404).send(resType);
    }
    const userAvailable = await userDetails.findById(req.body.userId);
    if (userAvailable === null) {
      resType.message = "User is not available";
      return res.status(404).send(resType);
    }
    //   Product is Available or not
    for (const index in req.body.productDetails) {
      product = await productDetail.findById(
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
        product.quantity >= req.body.productDetails[index].qty
      ) {
        product.quantity =
          product.quantity - req.body.productDetails[index].qty;
        await product.save();
        if (
          product.companyid === req.body.productDetails[index].companyid &&
          orderArray &&
          orderArray.length > 0 &&
          orderArray.findIndex(
            (x) =>
              x.orderDetail.findIndex(
                (y) => y.companyid === req.body.productDetails[index].companyid
              ) > -1
          ) > -1
        ) {
          let Index = orderArray.findIndex(
            (x) =>
              x.orderDetail.findIndex(
                (y) => y.companyid === req.body.productDetails[index].companyid
              ) > -1
          );
          orderArray[Index].orderDetail.push({
            _id: req.body.productDetails[index]._id,
            name: req.body.productDetails[index].name,
            img: req.body.productDetails[index].img,
            imagelist: req.body.productDetails[index].imagelist,
            rating: req.body.productDetails[index].rating,
            returnpolicy: req.body.productDetails[index].returnpolicy,
            totalrating: req.body.productDetails[index].totalrating,
            type: req.body.productDetails[index].type,
            unit: req.body.productDetails[index].unit,
            orderqty: req.body.productDetails[index].qty,
            deliverycharge: req.body.productDetails[index].deliverycharge,
            price: req.body.productDetails[index].price,
            originalprice: req.body.productDetails[index].originalprice,
            offerpercentage: req.body.productDetails[index].offerpercentage,
            company: req.body.productDetails[index].company,
            companyid: req.body.productDetails[index].companyid,
          });
        } else {
          orderArray.push({
            orderId: 0,
            addressDetail: {},
            totalorderPrice: 0,
            totalDeliveryCharge: 0,
            totaloriginalPrice: 0,
            totalofferPercentage: "",
            orderTime: today.toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            }),
            deliveryTime: tomorrow.toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            }),
            orderDetail: [
              {
                _id: req.body.productDetails[index]._id,
                name: req.body.productDetails[index].name,
                img: req.body.productDetails[index].img,
                imagelist: req.body.productDetails[index].imagelist,
                rating: req.body.productDetails[index].rating,
                returnpolicy: req.body.productDetails[index].returnpolicy,
                totalrating: req.body.productDetails[index].totalrating,
                type: req.body.productDetails[index].type,
                unit: req.body.productDetails[index].unit,
                orderqty: req.body.productDetails[index].qty,
                deliverycharge: req.body.productDetails[index].deliverycharge,
                price: req.body.productDetails[index].price,
                originalprice: req.body.productDetails[index].originalprice,
                offerpercentage: req.body.productDetails[index].offerpercentage,
                company: req.body.productDetails[index].company,
                companyid: req.body.productDetails[index].companyid,
              },
            ],
          });
        }
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
      const address = await addressDetails.findOne({ userId: req.body.userId });
      if (address === null) {
        resType.message = "User have no address save in our Database.";
        return res.status(404).send(resType);
      }
      if (
        address.address &&
        address.address.findIndex(
          (x) =>
            String(x.addressId) === String(req.body.deliveryaddress.addressId)
        ) > -1
      ) {
        let addressIndex = address.address.findIndex(
          (x) =>
            String(x.addressId) === String(req.body.deliveryaddress.addressId)
        );
        orderArray.forEach((e) => {
          e.addressDetail = address.address[addressIndex];
        });
        // let tempAddress = address.address[addressIndex];
        // address.address.splice(
        //   address.address.findIndex(
        //     (x) => x.addressId === req.body.deliveryaddress.addressId
        //   ),
        //   1
        // );
        // address.address.splice(0, 0, tempAddress);
        // let tempAdd = [];
        // address.address.forEach((e) => {
        //   if (e.addressId === req.body.deliveryaddress.addressId) {
        //     e.isRecentlyUsed = true;
        //   } else {
        //     e.isRecentlyUsed = false;
        //   }
        //   tempAdd.push(e);
        // });
        // address.address = tempAdd;
      } else {
        resType.message = "This address is not save in our Database.";
        return res.status(404).send(resType);
      }
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
      const orderData = await orderDetail.findOne({ userId: req.body.userId });
      if (orderData === null) {
        orderArray.forEach((e, index) => {
          e.orderId =
            "ODD" +
            new Date().getMilliseconds() +
            new Date().getSeconds() +
            new Date().getDay() +
            new Date().getMonth() +
            new Date().getFullYear() +
            String(index);
          e.orderDetail.forEach((x) => {
            e.totalorderPrice += Number(x.price) * Number(x.orderqty);
            e.totaloriginalPrice +=
              Number(x.originalprice) * Number(x.orderqty);
            e.totalDeliveryCharge += Number(
              x.deliverycharge ? x.deliverycharge : 0
            );
          });
          e.totalofferPercentage =
            String(
              parseFloat(
                ((e.totaloriginalPrice - e.totalorderPrice) /
                  e.totalorderPrice) *
                  100
              ).toFixed(2)
            ) + "%";
          e.paymentMethod = req.body.paymentMethod;
          e.isOrderPlaced = true;
          e.isOrderPacked = false;
          e.isOrderDispatched = false;
          e.isOrderOutForDelivery = false;
          e.isOrderDelivered = false;
        });
        resType.data = await orderDetail.create({
          orderDetails: orderArray,
          userId: req.body.userId,
        });
      } else {
        let tempArr = [];
        orderArray.forEach((e, index) => {
          e.orderId =
            "ODD" +
            new Date().getMilliseconds() +
            new Date().getSeconds() +
            new Date().getDay() +
            new Date().getMonth() +
            new Date().getFullYear() +
            String(orderData.orderDetails.length + index);
          e.orderDetail.forEach((x) => {
            e.totalorderPrice += Number(x.price) * Number(x.orderqty);
            e.totaloriginalPrice +=
              Number(x.originalprice) * Number(x.orderqty);
            e.totalDeliveryCharge += Number(
              x.deliverycharge ? x.deliverycharge : 0
            );
          });
          e.totalofferPercentage =
            String(
              parseFloat(
                ((e.totaloriginalPrice - e.totalorderPrice) /
                  e.totalorderPrice) *
                  100
              ).toFixed(2)
            ) + "%";
          e.paymentMethod = req.body.paymentMethod;
          e.isOrderPlaced = true;
          e.isOrderPacked = false;
          e.isOrderDispatched = false;
          e.isOrderOutForDelivery = false;
          e.isOrderDelivered = false;
          tempArr.push(e);
        });
        orderData.orderDetails.forEach((e) => {
          tempArr.push(e);
        });
        orderData.orderDetails = tempArr;
        resType.data = await orderData.save();
      }

      // await address.save();
      await cartDetails.save();

      resType.message = "Order Placed Successfully";
      resType.status = true;
      return res.status(200).send(resType);
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Get Order Details by User Id
router.get("/get-order-details/:userId", async (req, res) => {
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
    const userDetail = await userDetails.findById(req.params.userId);
    if (userDetail === null) {
      resType.message = "User is not present in our Database";
      return res.status(404).send(resType);
    }
    const orderDetails = await orderDetail.findOne({
      userId: req.params.userId,
    });
    if (orderDetails === null) {
      resType.status = true;
      resType.message = "You have no order";
      return res.status(200).send(resType);
    }

    for (const i in orderDetails.orderDetails) {
      for (const j in orderDetails.orderDetails[i].orderDetail) {
        const product = await productDetail.findById(
          orderDetails.orderDetails[i].orderDetail[j]._id
        );
        const rate = await rateDetail.findOne({
          productId: orderDetails.orderDetails[i].orderDetail[j]._id,
        });
        if (product !== null) {
          orderDetails.orderDetails[i].orderDetail[j].rating = product.rating;
          orderDetails.orderDetails[i].orderDetail[j].totalrating =
            product.totalrating;
          if (rate !== null) {
            if (
              rate.fiveStar &&
              rate.fiveStar.length > 0 &&
              rate.fiveStar.findIndex((x) => x === req.params.userId) > -1
            ) {
              orderDetails.orderDetails[i].orderDetail[j].userRating = "5";
            } else if (
              rate.fiveStar &&
              rate.fourStar.length > 0 &&
              rate.fourStar.findIndex((x) => x === req.params.userId) > -1
            ) {
              orderDetails.orderDetails[i].orderDetail[j].userRating = "4";
            } else if (
              rate.threeStar &&
              rate.threeStar.length > 0 &&
              rate.threeStar.findIndex((x) => x === req.params.userId) > -1
            ) {
              orderDetails.orderDetails[i].orderDetail[j].userRating = "3";
            } else if (
              rate.twoStar &&
              rate.twoStar.length > 0 &&
              rate.twoStar.findIndex((x) => x === req.params.userId) > -1
            ) {
              orderDetails.orderDetails[i].orderDetail[j].userRating = "2";
            } else if (
              rate.oneStar &&
              rate.oneStar.length > 0 &&
              rate.oneStar.findIndex((x) => x === req.params.userId) > -1
            ) {
              orderDetails.orderDetails[i].orderDetail[j].userRating = "1";
            } else {
              orderDetails.orderDetails[i].orderDetail[j].userRating = "-1";
            }
          } else {
            orderDetails.orderDetails[i].orderDetail[j].userRating = "-1";
          }
        }
      }
    }
    resType.data = orderDetails.orderDetails;
    resType.message = "Successful";
    resType.status = true;
    return res.status(200).send(resType);
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Get Order Details by User Id and Order Id
router.get("/get-order-details/:userId/:orderId", async (req, res) => {
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
    if (!req.params.orderId) {
      resType.message = "Order Id is Required";
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
      resType.status = true;
      resType.message = "You have no order";
      return res.status(200).send(resType);
    }
    flag = false;
    for (const i in orderDetails.orderDetails) {
      if (orderDetails.orderDetails[i].orderId === req.params.orderId) {
        for (const j in orderDetails.orderDetails[i].orderDetail) {
          const product = await productDetail.findById(
            orderDetails.orderDetails[i].orderDetail[j]._id
          );
          const rate = await rateDetail.findOne({
            productId: orderDetails.orderDetails[i].orderDetail[j]._id,
          });
          if (product !== null) {
            orderDetails.orderDetails[i].orderDetail[j].rating = product.rating;
            orderDetails.orderDetails[i].orderDetail[j].totalrating =
              product.totalrating;
            if (rate !== null) {
              if (
                rate.fiveStar &&
                rate.fiveStar.length > 0 &&
                rate.fiveStar.findIndex((x) => x === req.params.userId) > -1
              ) {
                orderDetails.orderDetails[i].orderDetail[j].userRating = "5";
              } else if (
                rate.fiveStar &&
                rate.fourStar.length > 0 &&
                rate.fourStar.findIndex((x) => x === req.params.userId) > -1
              ) {
                orderDetails.orderDetails[i].orderDetail[j].userRating = "4";
              } else if (
                rate.threeStar &&
                rate.threeStar.length > 0 &&
                rate.threeStar.findIndex((x) => x === req.params.userId) > -1
              ) {
                orderDetails.orderDetails[i].orderDetail[j].userRating = "3";
              } else if (
                rate.twoStar &&
                rate.twoStar.length > 0 &&
                rate.twoStar.findIndex((x) => x === req.params.userId) > -1
              ) {
                orderDetails.orderDetails[i].orderDetail[j].userRating = "2";
              } else if (
                rate.oneStar &&
                rate.oneStar.length > 0 &&
                rate.oneStar.findIndex((x) => x === req.params.userId) > -1
              ) {
                orderDetails.orderDetails[i].orderDetail[j].userRating = "1";
              } else {
                orderDetails.orderDetails[i].orderDetail[j].userRating = "-1";
              }
            } else {
              orderDetails.orderDetails[i].orderDetail[j].userRating = "-1";
            }
          }
        }
        resType.message = "Successful";
        resType.data = orderDetails.orderDetails[i];
        resType.status = true;
        return res.status(200).send(resType);
      }
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Delivery Charge
router.post("/delivery-charge", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  if (!req.body.minDeliveryAmt) {
    resType.message = "Minimum Delivery Amount is Required";
    return res.status(404).send(resType);
  }
  const deliveryChargeDetail = await deliveryCharge.find({});
  if (
    typeof deliveryChargeDetail === "object" &&
    deliveryChargeDetail.length === 0
  ) {
    if (req.body.chargeAmt) {
      resType.data = await deliveryCharge.create({
        minDeliveryAmt: req.body.minDeliveryAmt,
        chargeAmt: req.body.chargeAmt,
      });
    } else {
      resType.data = await deliveryCharge.create({
        minDeliveryAmt: req.body.minDeliveryAmt,
      });
    }

    resType.status = true;
    resType.message = "Successful";
    return res.status(200).send(resType);
  } else {
    if (!req.body.previousAmt) {
      resType.message = "Previous Amount is Required";
      return res.status(404).send(resType);
    }
    const deliveryChargeDetailAmt = await deliveryCharge.findOne({
      minDeliveryAmt: req.body.previousAmt,
    });
    if (deliveryChargeDetailAmt === null) {
      resType.message = "No Amount is Present";
      return res.status(404).send(resType);
    }
    deliveryChargeDetailAmt.minDeliveryAmt = req.body.minDeliveryAmt;
    if (req.body.chargeAmt) {
      deliveryChargeDetailAmt.chargeAmt = req.body.chargeAmt;
    }
    resType.data = await deliveryChargeDetailAmt.save();
    resType.status = true;
    resType.message = "Successful";
    return res.status(200).send(resType);
  }
});

// Get Delivery Charge
router.get("/get-delivery-charge", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  const deliveryChargeDetail = await deliveryCharge.find({});
  if (deliveryChargeDetail && deliveryChargeDetail.length === 0) {
    resType.message = "No Delivery Charge is Required";
    resType.status = true;
    return res.status(200).send(resType);
  } else {
    resType.data = {
      deliveryCharge: deliveryChargeDetail[0].minDeliveryAmt,
      chargeAmt: deliveryChargeDetail[0].chargeAmt,
    };
    resType.message = "Successful";
    resType.status = true;
    return res.status(200).send(resType);
  }
});

// Update Order
router.post("/update-order", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.body.orderId) {
      resType.message = "Order Id is Required";
      return res.status(404).send(resType);
    }
    if (!req.body.userId) {
      resType.message = "User Id is Required";
      return res.status(404).send(resType);
    }
    if (!req.body.orderStatus) {
      resType.message = "Order Status is Required";
      return res.status(404).send(resType);
    }
    const orderDetails = await orderDetail.findOne({ userId: req.body.userId });
    if (orderDetails === null) {
      resType.message = "User have no order";
      return res.status(404).send(resType);
    }
    flag = true;
    let tempArray = orderDetails.orderDetails;
    for (const index in tempArray) {
      if (tempArray[index].orderId === req.body.orderId) {
        if (
          req.body.orderStatus === "packed" &&
          tempArray[index].isOrderPlaced &&
          !tempArray[index].isOrderPacked
        ) {
          tempArray[index].isOrderPacked = true;
          tempArray[index].orderPackedTime = new Date().toLocaleString(
            "en-US",
            {
              timeZone: "Asia/Kolkata",
            }
          );
          orderDetails.orderDetails.splice(index, 1, tempArray[index]);
          await orderDetails.save();
        } else if (
          req.body.orderStatus === "dispatched" &&
          tempArray[index].isOrderPlaced &&
          tempArray[index].isOrderPacked &&
          !tempArray[index].isOrderDispatched
        ) {
          tempArray[index].isOrderDispatched = true;
          tempArray[index].dispatchedTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          });
          orderDetails.orderDetails.splice(index, 1, tempArray[index]);
          await orderDetails.save();
        } else if (
          req.body.orderStatus === "out_for_delivery" &&
          tempArray[index].isOrderPlaced &&
          tempArray[index].isOrderPacked &&
          tempArray[index].isOrderDispatched &&
          !tempArray[index].isOrderOutForDelivery
        ) {
          tempArray[index].isOrderOutForDelivery = true;
          tempArray[index].outForDeliveryTime = new Date().toLocaleString(
            "en-US",
            {
              timeZone: "Asia/Kolkata",
            }
          );
          orderDetails.orderDetails.splice(index, 1, tempArray[index]);
          await orderDetails.save();
        } else if (
          req.body.orderStatus === "delivered" &&
          tempArray[index].isOrderPlaced &&
          tempArray[index].isOrderPacked &&
          tempArray[index].isOrderDispatched &&
          tempArray[index].isOrderOutForDelivery &&
          !tempArray[index].isOrderDelivered
        ) {
          tempArray[index].isOrderDelivered = true;
          tempArray[index].deliveryTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          });
          tempArray[index].orderDetail.forEach((x) => {
            if (x.returnpolicy) {
              if (x.returnpolicy.includes("hr")) {
                let hr = parseInt(x.returnpolicy.split("hr")[0]);
                var dt = new Date();
                dt.setHours(dt.getHours() + hr);
                x.isReturnable = true;
                x.returnTime = dt.toLocaleString("en-US", {
                  timeZone: "Asia/Kolkata",
                });
              }
            } else {
              x.isReturnable = false;
            }
          });
          orderDetails.orderDetails.splice(index, 1, tempArray[index]);
          await orderDetails.save();
        } else if (req.body.orderStatus === "return_proccess") {
          tempArray[index].isOrderReturnablePlaced = true;
          tempArray[index].orderReturnablePlacedTime =
            new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            });
          orderDetails.orderDetails.splice(index, 1, tempArray[index]);
          await orderDetails.save();
        } else if (
          req.body.orderStatus === "return_out_for_pick" &&
          tempArray[index].isOrderReturnablePlaced
        ) {
          tempArray[index].isOrderReturnOutForPicked = true;
          tempArray[index].orderReturnOutForPickedTime =
            new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            });
          orderDetails.orderDetails.splice(index, 1, tempArray[index]);
          await orderDetails.save();
        } else if (
          req.body.orderStatus === "return_picked" &&
          tempArray[index].isOrderReturnablePlaced &&
          tempArray[index].isOrderReturnOutForPicked
        ) {
          tempArray[index].isOrderReturnPicked = true;
          tempArray[index].orderReturnPickedTime = new Date().toLocaleString(
            "en-US",
            {
              timeZone: "Asia/Kolkata",
            }
          );
          orderDetails.orderDetails.splice(index, 1, tempArray[index]);
          await orderDetails.save();
        } else if (
          req.body.orderStatus === "return_delivered" &&
          tempArray[index].isOrderReturnablePlaced &&
          tempArray[index].isOrderReturnOutForPicked &&
          tempArray[index].isOrderReturnPicked
        ) {
          tempArray[index].isOrderReturnableDelivered = true;
          tempArray[index].orderReturnableDeliveredTime =
            new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            });
          tempArray[index].orderDetail.forEach((x) => {
            if (x.returnpolicy) {
              if (x.returnpolicy.includes("hr")) {
                let hr = parseInt(x.returnpolicy.split("hr")[0]);
                var dt = new Date();
                dt.setHours(dt.getHours() + hr);
                x.isReturnable = true;
                x.returnTime = dt.toLocaleString("en-US", {
                  timeZone: "Asia/Kolkata",
                });
              }
            } else {
              x.isReturnable = false;
            }
          });
          orderDetails.orderDetails.splice(index, 1, tempArray[index]);
          await orderDetails.save();
        } else {
          resType.message = "Something Error Occurred";
          return res.status(404).send(resType);
        }
        flag = false;
        resType.data = orderDetails.orderDetails[index];
        resType.status = true;
        resType.message = "Successful";
        return res.status(200).send(resType);
      }
    }
    if (flag) {
      resType.message = "This order is not present in our database";
      return res.status(404).send(resType);
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Cancel All or Particular Order
router.post("/cancel-order", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.body.userId) {
      resType.message = "User Id is Required";
      return res.status(404).send(resType);
    }
    if (req.body.productId && req.body.productId.length === 0) {
      resType.message = "Product Id is Required";
      return res.status(404).send(resType);
    }
    if (!req.body.orderId) {
      resType.message = "Order Id is Required";
      return res.status(404).send(resType);
    }
    const userDetail = await userDetails.findById(req.body.userId);
    if (userDetail === null) {
      resType.message = "User is not present in our Database";
      return res.status(404).send(resType);
    }
    const orderDetails = await orderDetail.findOne({ userId: req.body.userId });
    let tempArray = orderDetails.orderDetails;
    let flag = false;
    for (const index in tempArray) {
      if (tempArray[index].orderId === req.body.orderId) {
        for (const j in tempArray[index].orderDetail) {
          if (
            req.body.productId.findIndex(
              (x) => x === tempArray[index].orderDetail[j]._id
            ) > -1
          ) {
            if (
              !tempArray[index].isOrderDelivered &&
              !tempArray[index].isOrderOutForDelivery
            ) {
              flag = true;
              tempArray[index].orderDetail[j].isOrderCancel = true;
              tempArray[index].orderDetail[j].cancelDate =
                new Date().toLocaleString("en-US", {
                  timeZone: "Asia/Kolkata",
                });
              const product = await productDetail.findById(
                tempArray[index].orderDetail[j]._id
              );
              if (product !== null) {
                product.quantity += tempArray[index].orderDetail[j].orderqty;
                await product.save();
              }
              tempArray[index].totaloriginalPrice -=
                Number(tempArray[index].orderDetail[j].originalprice) *
                tempArray[index].orderDetail[j].orderqty;
              tempArray[index].totalorderPrice -=
                Number(tempArray[index].orderDetail[j].price) *
                tempArray[index].orderDetail[j].orderqty;
              tempArray[index].totalofferPercentage =
                (
                  100 -
                  (tempArray[index].totalorderPrice /
                    tempArray[index].totaloriginalPrice) *
                    100
                ).toFixed(2) + "% off";
              // const deliveryChargeDetail = await deliveryCharge.find({});
              // if (
              //   Number(tempArray[index].totaloriginalPrice) <
              //   Number(deliveryChargeDetail.minDeliveryAmt)
              // ) {
              //   tempArray[index].totaloriginalPrice += Number(
              //     deliveryChargeDetail.chargeAmt
              //   );
              //   tempArray[index].deliveryCharge += Number(
              //     deliveryChargeDetail.chargeAmt
              //   );
              // }
            } else {
              resType.message = "Ordered can not be cancelled";
              return res.status(400).send(resType);
            }
          }
        }
      }
    }
    if (!flag) {
      resType.message = "Ordered Id is not Found";
      return res.status(400).send(resType);
    }
    orderDetails.orderDetails = [];
    orderDetails.orderDetails = tempArray;
    resType.status = true;
    resType.data = await orderDetails.save();
    resType.message = "Successfuly Canceled";
    return res.status(200).send(resType);
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Return All or Particular Order
router.post("/return-order", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.body.userId) {
      resType.message = "User Id is Required";
      return res.status(404).send(resType);
    }
    if (req.body.productId && req.body.productId.length === 0) {
      resType.message = "Product Id is Required";
      return res.status(404).send(resType);
    }
    if (!req.body.orderId) {
      resType.message = "Order Id is Required";
      return res.status(404).send(resType);
    }
    const userDetail = await userDetails.findById(req.body.userId);
    if (userDetail === null) {
      resType.message = "User is not present in our Database";
      return res.status(404).send(resType);
    }
    const orderDetails = await orderDetail.findOne({ userId: req.body.userId });
    let tempArray = orderDetails.orderDetails;
    let flag = false;
    for (const index in tempArray) {
      if (tempArray[index].orderId === req.body.orderId) {
        for (const j in tempArray[index].orderDetail) {
          if (
            req.body.productId.findIndex(
              (x) => x === tempArray[index].orderDetail[j]._id
            ) > -1
          ) {
            if (tempArray[index].isOrderDelivered) {
              flag = true;
              tempArray[index].orderDetail[j].isOrderReturnablePlaced = true;
              tempArray[index].orderDetail[j].isOrderReturnOutForPicked = false;
              tempArray[index].orderDetail[j].isOrderReturnPicked = false;
              tempArray[index].orderDetail[
                j
              ].isOrderReturnableDelivered = false;
              tempArray[index].orderDetail[j].orderReturnablePlacedTime =
                new Date().toLocaleString("en-US", {
                  timeZone: "Asia/Kolkata",
                });
            } else {
              resType.message = "Order can not be Return untill Delivered";
              return res.status(400).send(resType);
            }
          }
        }
      }
    }
    if (!flag) {
      resType.message = "Ordered Id is not Found";
      return res.status(400).send(resType);
    }
    orderDetails.orderDetails = [];
    orderDetails.orderDetails = tempArray;
    resType.status = true;
    resType.data = await orderDetails.save();
    resType.message = "Successfuly Return Processed";
    return res.status(200).send(resType);
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

module.exports = router;
