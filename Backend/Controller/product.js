const router = require("express").Router();

const productDetail = require("../Models/product-details");
const imageUpload = require("../Service/image-upload");

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
  } catch (err) {
    resType.message = err;
    return res.status(400).send(resType);
  }
});

module.exports = router;
