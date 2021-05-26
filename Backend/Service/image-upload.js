const cloudinary = require("cloudinary").v2;
const dotEnv = require("dotenv");
dotEnv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = {
  imageUploader: async (param) => {
    let imageUrl = "";
    await cloudinary.uploader.upload(param, {}, (err, imageRes) => {
      if (err) {
        console.log(err.message);
      }
      imageUrl = imageRes.secure_url;
    });
    return imageUrl;
  },
};
