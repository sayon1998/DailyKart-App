const jwt = require("jsonwebtoken");

module.exports = {
  isAuthenticated: (req, res, next) => {
    const resType = {
      Message: "Unauthorized Access",
    };
    if (typeof req.headers.authorization !== "undefined") {
      let token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
          console.log(err.message);
          return res.status(500).send(resType);
        }
        if (decoded && decoded.role && decoded.role == "user") {
          req.userNameFromJWT = decoded._id;
          return next();
        } else {
          return res.status(500).send(resType);
        }
      });
    } else {
      return res.status(500).send(resType);
    }
  },
};
