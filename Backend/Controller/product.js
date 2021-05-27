const router = require("express").Router();

const productDetail = require("../Models/product-details");
const cartWishlist = require("../Models/cart-wishlist");
const userDetail = require("../Models/user-details");
const imageUpload = require("../Service/image-upload");

// Get All Products
router.post("/products", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.body.startIndex) {
      resType.message = "Start Index is Required";
      return res.status(404).send(resType);
    }
    if (!req.body.limit) {
      resType.message = "Limit is Required";
      return res.status(404).send(resType);
    }
    if (parseInt(req.body.limit) === 0) {
      resType.message = "Limit should be greater than zero";
      return res.status(400).send(resType);
    }
    await productDetail
      .find({})
      .where("quantity")
      .ne(0)
      .skip(parseInt(req.body.startIndex))
      .limit(parseInt(req.body.limit))
      .sort("-date")
      .exec(async (err, params) => {
        if (err) {
          resType.message = err.message;
          return res.status(400).send(resType);
        }
        if (params === null) {
          resType.message = "No product is Available";
          return res.status(404).send(resType);
        }
        resType.status = true;
        resType.message = "Successful";
        resType.data = {
          startIndex: String(
            parseInt(req.body.startIndex) + parseInt(req.body.limit)
          ),
          totalLimit: (await productDetail.find({})).length,
          productDetails: params,
        };
        return res.status(200).send(resType);
      });
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Get Product Details by Id
router.get("/productbyid/:_id", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  try {
    if (!req.params._id) {
      resType.message = "Product id is Required";
      return res.status(404).send(resType);
    }
    await productDetail.findById(req.params._id, async (err, params) => {
      if (err) {
        resType.message = err.message;
        return res.status(400).send(resType);
      }
      if (params === null) {
        resType.message = "Product details is not present in our database";
        return res.status(404).send(resType);
      }
      params.imagelist.push(params.img);
      resType.status = true;
      resType.message = "Successful";
      resType.data = params;
      return res.status(200).send(resType);
    });
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Save Product Details
router.post("/save-product", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  let imageList = [];
  let mainImg = "";
  try {
    if (!req.body._id) {
      if (!req.body.name) {
        resType.message = "Product Name is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.description) {
        resType.message = "Product Description is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.unit) {
        resType.message = "Product Unit is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.perunit) {
        resType.message = "Product Perunit is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.quantity) {
        resType.message = "Product Quantity is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.minqty) {
        resType.message = "Product Minimum Quantity is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.highestquentity) {
        resType.message = "Product Heighest Quantity is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.price) {
        resType.message = "Product Price is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.originalprice) {
        resType.message = "Product Original Price is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.offerpercentage) {
        resType.message = "Product Offer Percentage is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.img) {
        resType.message = "Product Main Image is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.type) {
        resType.message = "Product Type is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.returnpolicy) {
        resType.message = "Returnpolicy is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.company) {
        resType.message = "Shop Name is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.icon) {
        resType.message = "Product Whishlist Icon is Required";
        return res.status(404).send(resType);
      }
      if (!req.body.paymentmode) {
        resType.message = "Payment Mode is Required";
        return res.status(404).send(resType);
      }
      if (req.body.imagelist && req.body.imagelist.length > 0) {
        mainImg = await imageUpload.imageUploader(req.body.img);
        for (const image in req.body.imagelist) {
          imageList.push(
            await imageUpload.imageUploader(req.body.imagelist[image])
          );
        }
      } else {
        mainImg = await imageUpload.imageUploader(req.body.img);
      }
      imageList.push(mainImg);
      resType.data = await productDetail.create({
        name: req.body.name,
        description: req.body.description,
        unit: req.body.unit,
        perunit: req.body.perunit,
        quantity: req.body.quantity,
        minqty: req.body.minqty,
        highestquentity: req.body.highestquentity,
        price: req.body.price,
        originalprice: req.body.originalprice,
        offerpercentage: req.body.offerpercentage,
        img: mainImg,
        imagelist: imageList,
        type: req.body.type,
        returnpolicy: req.body.returnpolicy,
        company: req.body.company,
        rating: req.body.rating,
        totalrating: req.body.totalrating,
        icon: req.body.icon,
        deliverycharge: req.body.deliverycharge,
        paymentmode: req.body.paymentmode,
      });
      resType.status = true;
      resType.message = `${resType.data.name} is Successfully Saved`;
      return res.status(200).send(resType);
    } else {
      await productDetail.findById(req.body._id, async (err, params) => {
        if (err) {
          resType.message = err.message;
          return res.status(400).send(resType);
        }
        if (params === null) {
          resType.message = "Product is not Found";
          return res.status(404).send(resType);
        }
        params.name = req.body.name;
        params.description = req.body.description;
        params.unit = req.body.unit;
        params.perunit = req.body.perunit;
        params.quantity = req.body.quantity;
        params.minqty = req.body.minqty;
        params.highestquentity = req.body.highestquentity;
        params.price = req.body.price;
        params.originalprice = req.body.originalprice;
        params.offerpercentage = req.body.offerpercentage;
        params.type = req.body.type;
        params.returnpolicy = req.body.returnpolicy;
        params.company = req.body.company;
        params.rating = req.body.rating;
        params.totalrating = req.body.totalrating;
        params.icon = req.body.icon;
        params.deliverycharge = req.body.deliverycharge;
        params.paymentmode = req.body.paymentmode;
        resType.data = await params.save();
        resType.message = `${params.name} is Successfully Updated`;
        resType.status = true;
        return res.status(200).send(resType);
      });
    }
  } catch (err) {
    resType.message = err;
    return res.status(400).send(resType);
  }
});

// Product Image Update
router.post("/update-product-image", async (req, res) => {
  const resType = {
    status: false,
    data: {},
    message: "",
  };
  let imageList = [];
  let mainImg = "";
  try {
    if (req.body.imagelist && req.body.imagelist.length > 0) {
      await productDetail.findById(req.body._id, async (err, params) => {
        if (err) {
          resType.message = err.message;
          return res.status(400).send(resType);
        }
        if (params === null) {
          resType.message = "Product id is not found";
          return res.status(400).send(resType);
        }
        if (req.body.img) {
          await imageUpload
            .imageDelete(params.img.split("/")[7].split(".")[0])
            .then(async (resData) => {
              if (resData.result === "ok") {
                mainImg = await imageUpload.imageUploader(req.body.img);
                params.img = mainImg;
                await params.save();
              } else {
                resType.message = resData.result;
                return res.status(200).send(resType);
              }
            });
        }
        for (const index in req.body.imagelist) {
          if (
            params.imagelist.findIndex(
              (x) => x === req.body.imagelist[index].previousImg
            ) > -1
          ) {
            await imageUpload
              .imageDelete(
                params.imagelist[
                  params.imagelist.findIndex(
                    (x) => x === req.body.imagelist[index].previousImg
                  )
                ]
                  .split("/")[7]
                  .split(".")[0]
              )
              .then(async (resData) => {
                if (resData.result === "ok") {
                  let ImgData = await imageUpload.imageUploader(
                    req.body.imagelist[index].img
                  );
                  imageList.push(ImgData);
                  params.imagelist.splice(
                    params.imagelist.findIndex(
                      (x) => x === req.body.imagelist[index].previousImg
                    ),
                    1,
                    ImgData
                  );
                }
              });
          }
        }
        await params.save();
        resType.status = true;
        resType.message = "Images is Updated Successfully";
        resType.data = { img: mainImg, imglist: imageList };
        return res.status(200).send(resType);
      });
    } else {
      await productDetail.findById(req.body._id, async (err, params) => {
        if (err) {
          resType.message = err.message;
          return res.status(400).send(resType);
        }
        if (params === null) {
          resType.message = "Product id is not found";
          return res.status(400).send(resType);
        }

        await imageUpload
          .imageDelete(params.img.split("/")[7].split(".")[0])
          .then(async (resData) => {
            if (resData.result === "ok") {
              mainImg = await imageUpload.imageUploader(req.body.img);
              params.img = mainImg;
              await params.save();
              resType.status = true;
              resType.message = "Main Image is Updated";
              resType.data = { img: mainImg };
              return res.status(200).send(resType);
            } else {
              resType.message = resData.result;
              return res.status(400).send(resType);
            }
          });
      });
    }
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});

// Add Cart & Wishlist Product
router.post("/save-cart-wishlist", async (req, res) => {
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
    if (
      req.body.cart &&
      req.body.cart.length < 1 &&
      req.body.wishlist &&
      req.body.wishlist.length < 1
    ) {
      resType.message = "Cart and Wishlist both can not be empty";
      return res.status(404).send(resType);
    }
    await cartWishlist.findOne(
      { userId: req.body.userId },
      async (err, cartWishParams) => {
        if (err) {
          resType.message = err.message;
          return res.status(400).send(resType);
        }
        if (cartWishParams === null) {
          // If no data present
          await userDetail.findById(req.body.userId, async (err, params) => {
            if (err) {
              resType.message = err.message;
              return res.status(400).send(resType);
            }
            if (params === null) {
              resType.message = "User is not present in our database";
              return res.status(404).send(resType);
            }
            if (req.body.cart && req.body.cart.length > 0) {
              await productDetail.findById(
                req.body.cart[0],
                async (err, cartparam) => {
                  if (err) {
                    resType.message = err.message;
                    return res.status(400).send(resType);
                  }
                  if (cartparam === null) {
                    resType.message = `${req.body.cart[0]} is not present in our database`;
                    return res.status(404).send(resType);
                  }
                  resType.data = await cartWishlist.create({
                    userId: req.body.userId,
                    cart: req.body.cart,
                    wishlist: req.body.wishlist,
                  });
                  resType.status = true;
                  resType.message = `${req.body.cart[0]} is successfully saved in your cart`;
                  return res.status(200).send(resType);
                }
              );
            } else if (req.body.wishlist && req.body.wishlist.length > 0) {
              await productDetail.findById(
                req.body.wishlist[0],
                async (err, wishlistparam) => {
                  if (err) {
                    resType.message = err.message;
                    return res.status(400).send(resType);
                  }
                  if (wishlistparam === null) {
                    resType.message = `${req.body.cart[0]} is not present in our database`;
                    return res.status(404).send(resType);
                  }
                  resType.data = await cartWishlist.create({
                    userId: req.body.userId,
                    cart: req.body.cart,
                    wishlist: req.body.wishlist,
                  });
                  resType.status = true;
                  resType.message = `${req.body.wishlist[0]} is successfully saved in your cart`;
                  return res.status(200).send(resType);
                }
              );
            }
          });
        } else {
          // Edit to previous value
          await userDetail.findById(req.body.userId, async (err, params) => {
            if (err) {
              resType.message = err.message;
              return res.status(400).send(resType);
            }
            if (params === null) {
              resType.message = "User is not present in our database";
              return res.status(404).send(resType);
            }
            if (req.body.cart && req.body.cart.length > 0) {
              await productDetail.findById(
                req.body.cart[0],
                async (err, cartparam) => {
                  if (err) {
                    resType.message = err.message;
                    return res.status(400).send(resType);
                  }
                  if (cartparam === null) {
                    resType.message = `${cartparam.name} is not present in our database`;
                    return res.status(404).send(resType);
                  }
                  if (
                    cartWishParams.cart.findIndex(
                      (x) => x === req.body.cart[0]
                    ) === -1
                  ) {
                    cartWishParams.cart.push(req.body.cart[0]);
                    resType.data = await cartWishParams.save();
                    resType.status = true;
                    resType.message = `${cartparam.name} is successfully saved in your cart`;
                    return res.status(200).send(resType);
                  } else {
                    resType.message = `${cartparam.name} is already saved in your cart`;
                    return res.status(400).send(resType);
                  }
                }
              );
            } else if (req.body.wishlist && req.body.wishlist.length > 0) {
              await productDetail.findById(
                req.body.wishlist[0],
                async (err, wishlistparam) => {
                  if (err) {
                    resType.message = err.message;
                    return res.status(400).send(resType);
                  }
                  if (wishlistparam === null) {
                    resType.message = `${req.body.wishlist[0]} is not present in our database`;
                    return res.status(404).send(resType);
                  }
                  if (
                    cartWishParams.wishlist.findIndex(
                      (x) => x === req.body.wishlist[0]
                    ) === -1
                  ) {
                    cartWishParams.wishlist.push(req.body.wishlist[0]);
                    resType.data = await cartWishParams.save();
                    resType.status = true;
                    resType.message = `${wishlistparam.name} is successfully saved in your wishlist`;
                    return res.status(200).send(resType);
                  } else {
                    resType.message = `${wishlistparam.name} is already saved in your wishlist`;
                    return res.status(400).send(resType);
                  }
                }
              );
            }
          });
        }
      }
    );
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});
// Delete Cart & Wishlist
router.post("/delete-cart-wishlist", async (req, res) => {
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
    if (
      req.body.cart &&
      req.body.cart.length < 1 &&
      req.body.wishlist &&
      req.body.wishlist.length < 1
    ) {
      resType.message = "Cart and Wishlist both can not be empty";
      return res.status(404).send(resType);
    }
    await cartWishlist.findOne(
      { userId: req.body.userId },
      async (err, cartWishParams) => {
        if (err) {
          resType.message = err.message;
          return res.status(400).send(resType);
        }
        if (cartWishParams === null) {
          // If no data present
          resType.message = "You have no cart and wishlist";
        } else {
          // Edit to previous value
          await userDetail.findById(req.body.userId, async (err, params) => {
            if (err) {
              resType.message = err.message;
              return res.status(400).send(resType);
            }
            if (params === null) {
              resType.message = "User is not present in our database";
              return res.status(404).send(resType);
            }
            if (req.body.cart && req.body.cart.length > 0) {
              await productDetail.findById(
                req.body.cart[0],
                async (err, cartparam) => {
                  if (err) {
                    resType.message = err.message;
                    return res.status(400).send(resType);
                  }
                  if (cartparam === null) {
                    resType.message = `${cartparam.name} is not present in our database`;
                    return res.status(404).send(resType);
                  }
                  if (
                    cartWishParams.cart.findIndex(
                      (x) => x === req.body.cart[0]
                    ) === -1
                  ) {
                    resType.status = false;
                    resType.message = `${cartparam.name} is not saved in your cart`;
                    return res.status(200).send(resType);
                  } else {
                    cartWishParams.cart.splice(
                      cartWishParams.cart.findIndex(
                        (x) => x === req.body.cart[0]
                      ),
                      1
                    );
                    resType.status = true;
                    resType.data = await cartWishParams.save();
                    resType.message = `${cartparam.name} is deleted from your cart`;
                    return res.status(200).send(resType);
                  }
                }
              );
            } else if (req.body.wishlist && req.body.wishlist.length > 0) {
              await productDetail.findById(
                req.body.wishlist[0],
                async (err, wishlistparam) => {
                  if (err) {
                    resType.message = err.message;
                    return res.status(400).send(resType);
                  }
                  if (wishlistparam === null) {
                    resType.message = `${req.body.wishlist[0]} is not present in our database`;
                    return res.status(404).send(resType);
                  }
                  if (
                    cartWishParams.wishlist.findIndex(
                      (x) => x === req.body.wishlist[0]
                    ) === -1
                  ) {
                    resType.message = `${wishlistparam.name} is not saved in your wishlist`;
                    return res.status(200).send(resType);
                  } else {
                    cartWishParams.wishlist.splice(
                      cartWishParams.wishlist.findIndex(
                        (x) => x === req.body.wishlist[0]
                      ),
                      1
                    );
                    resType.data = await cartWishParams.save();
                    resType.status = true;
                    resType.message = `${wishlistparam.name} is deleted from your wishlist`;
                    return res.status(200).send(resType);
                  }
                }
              );
            }
          });
        }
      }
    );
  } catch (err) {
    resType.message = err.message;
    return res.status(400).send(resType);
  }
});
module.exports = router;
