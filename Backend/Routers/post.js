const router = require("express").Router();
const userDetails = require("../Models/user-details");
const messages = require("../Models/messages");
const deviceInfo = require("../Models/device-details");
const firebasePush = require("../Models/firebase-push-details");
const siteMap = require("../Models/sitemap-details");
const loveCrush = require("../Models/love-crush");
const adminUser = require("../Models/admin-user");
const dareDetails = require("../Models/dare-details");
const dareUsers = require("../Models/dare-users");
const dareQnAUser = require("../Models/dare-question-with-user");
const jwt = require("jsonwebtoken");
const jwtTokenVerify = require("../Service/jwt-token-verify");
const btoa = require("btoa");
const axios = require("axios");

// Save User Name with Id & Token
router.post("/savedetails", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  if (!req.body.username) {
    resType["Message"] = "User's Name is Required";
    return res.status(400).send(resType);
  }
  if (!req.body.role) {
    resType["Message"] = "User's Role is Required";
    return res.status(400).send(resType);
  }
  try {
    let checkname = req.body.username.split(" ").join("");
    const prevData = await userDetails.findOne({ username: checkname });
    if (prevData) {
      let username = "";
      if (req.body.username.includes(" ")) {
        username =
          req.body.username.split(" ").join("") +
          Math.random().toString(36).substring(7);
      } else {
        username = req.body.username + Math.random().toString(36).substring(7);
      }
      const afterUserNameSet = await userDetails.findOne({
        username: username,
      });
      if (afterUserNameSet) {
        // let username = "";
        if (req.body.username.includes(" ")) {
          username =
            req.body.username.split(" ").join("") +
            Math.random().toString(36).substring(7);
        } else {
          username =
            req.body.username + Math.random().toString(36).substring(7);
        }
      }
      const token = jwt.sign(
        { _id: username, role: req.body.role },
        process.env.TOKEN_SECRET,
        {
          issuer: "unimansyst@gmail.com",
          audience: username,
        }
      );
      const saveDetails = new userDetails({
        username: username,
        displayname: req.body.username,
        role: req.body.role,
        token: token,
        link: "secret-message/share-link/" + btoa(username),
        encyptduser: btoa(username),
        userpin: (Math.random() * 1000000).toFixed(),
        longitude: "",
        latitude: "",
      });
      try {
        resType[
          "Message"
        ] = `${saveDetails.displayname} is Register Successfully`;
        resType["Status"] = true;
        resType["Data"] = [await saveDetails.save()];
        return res.status(200).send(resType);
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
    } else {
      let username = "";
      if (req.body.username.includes(" ")) {
        username = req.body.username.split(" ").join("");
      } else {
        username = req.body.username;
      }
      const token = jwt.sign(
        { _id: username, role: req.body.role },
        process.env.TOKEN_SECRET,
        {
          issuer: "sayonchakraborty1998@gmail.com",
          audience: username,
        }
      );
      const saveDetails = new userDetails({
        username: username,
        displayname: req.body.username,
        role: req.body.role,
        token: token,
        link: "secret-message/share-link/" + btoa(username),
        encyptduser: btoa(username),
        userpin: (Math.random() * 1000000).toFixed(),
        longitude: "",
        latitude: "",
      });
      try {
        resType[
          "Message"
        ] = `${saveDetails.displayname} is Register Successfully`;
        resType["Status"] = true;
        resType["Data"] = [await saveDetails.save()];
        return res.status(200).send(resType);
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
    }
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
// Save User Messages
// jwtTokenVerify.isAuthenticated,
router.post("/savemessages", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  let userName = "";
  if (!req.body.userid) {
    resType["Message"] = "User's Id is Required";
    return res.status(400).send(resType);
  }
  try {
    const userData = await userDetails.findOne({ _id: req.body.userid });
    if (userData) {
      userName = userData.encyptduser;
      await messages.findOne(
        { userid: req.body.userid },
        async (err, params) => {
          if (err) {
            resType["Message"] = err.message;
            return res.status(400).send(resType);
          }
          if (params === null) {
            messages.create({
              userid: req.body.userid,
              messagedetails: [
                {
                  message: req.body.message,
                  seen: false,
                  base64image: req.body.base64image,
                  date: new Date(),
                  longitude: req.body.longitude
                    ? req.body.longitude
                    : "No Data Found",
                  latitude: req.body.latitude
                    ? req.body.latitude
                    : "No Data Found",
                  browser: req.body.browser,
                  browser_version: req.body.browser_version,
                  device: req.body.device,
                  deviceType: req.body.deviceType,
                  orientation: req.body.orientation,
                  os: req.body.os,
                  os_version: req.body.os_version,
                  userAgent: req.body.userAgent,
                  ip: req.body.ip,
                },
              ],
            });
          } else {
            params.messagedetails.push({
              message: req.body.message,
              date: new Date(),
              seen: false,
              base64image: req.body.base64image,
              longitude: req.body.longitude
                ? req.body.longitude
                : "No Data Found",
              latitude: req.body.latitude ? req.body.latitude : "No Data Found",
              browser: req.body.browser,
              browser_version: req.body.browser_version,
              device: req.body.device,
              deviceType: req.body.deviceType,
              orientation: req.body.orientation,
              os: req.body.os,
              os_version: req.body.os_version,
              userAgent: req.body.userAgent,
              ip: req.body.ip,
            });
            params.save();
          }
        }
      );
      if (
        req.body.endpoints &&
        (req.body.endpoints !== "" || req.body.endpoints !== null)
      ) {
        await axios
          .post(
            process.env.FIREBASE_CLOUD_MESSAGE_URL,
            {
              notification: {
                title: "Social Message",
                body: `Check anonymously someone messaged you that ${
                  req.body.message && req.body.message.length > 10
                    ? req.body.message.slice(0, 10) + "..."
                    : req.body.message
                }`,
                icon:
                  "https://res.cloudinary.com/dzruu87x0/image/upload/v1612033640/secret-message_lgicit.png",
                click_action: `https://socail-game.web.app/secret-message/messages/${userName}`,
              },
              to: req.body.endpoints,
            },
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-type": "application/json",
                Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
              },
            }
          )
          .then(
            (response) => {
              var response = response.data;
              console.log(response);
              resType["Status"] = true;
              resType["Message"] = "Successful";
              return res.status(200).send(resType);
            },
            (error) => {
              var status = error.response.status;
              console.log(status);
              resType["Message"] = error.message;
              return res.status(400).send(resType);
            }
          );
      } else {
        resType["Status"] = true;
        resType["Message"] = "Successful";
        return res.status(200).send(resType);
      }
    } else {
      resType["Message"] = "Username is not Valid";
      return res.status(400).send(resType);
    }
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
// User Login
router.post("/user-login", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  if (!req.body.username) {
    resType["Message"] = "Username is Required";
    return res.status(400).send(resType);
  }
  if (!req.body.userpin) {
    resType["Message"] = "User's pin is Required";
    return res.status(400).send(resType);
  }
  if (req.body.role == "user") {
    try {
      const userData = await userDetails.findOne({
        username: req.body.username,
      });
      if (!userData) {
        resType["Message"] = "Username is not registered";
        return res.status(400).send(resType);
      }
      if (
        userData.userpin &&
        req.body.userpin &&
        userData.userpin != req.body.userpin
      ) {
        resType["Message"] = "Your pin is Incorrect";
        return res.status(400).send(resType);
      } else if (
        userData.userpin &&
        req.body.userpin &&
        userData.userpin === req.body.userpin
      ) {
        resType["Status"] = true;
        resType["Message"] = `${userData.displayname} is Successfully login`;
        resType["Data"] = [
          {
            _id: userData._id,
            username: userData.username,
            displayname: userData.displayname,
            userpin: userData.userpin,
            token: userData.token,
            link: userData.link,
            encyptduser: userData.encyptduser,
            longitude: userData.longitude,
            latitude: userData.latitude,
            date: userData.date,
          },
        ];
        return res.status(200).send(resType);
      } else {
        resType["Message"] = "User's pin is not set in our Database";
        return res.status(400).send(resType);
      }
    } catch (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
  } else if (req.body.role == "dare-games") {
    try {
      const userData = await dareUsers.findOne({
        username: req.body.username,
      });
      if (!userData) {
        resType["Message"] = "Username is not registered";
        return res.status(400).send(resType);
      }
      if (
        userData.userpin &&
        req.body.userpin &&
        userData.userpin != req.body.userpin
      ) {
        resType["Message"] = "Your pin is Incorrect";
        return res.status(400).send(resType);
      } else if (
        userData.userpin &&
        req.body.userpin &&
        userData.userpin === req.body.userpin
      ) {
        resType["Status"] = true;
        resType["Message"] = `${userData.displayname} is Successfully login`;
        resType["Data"] = [
          {
            _id: userData._id,
            username: userData.username,
            displayname: userData.displayname,
            userpin: userData.userpin,
            token: userData.token,
            link: userData.link,
            encyptduser: userData.encyptduser,
            longitude: userData.longitude,
            latitude: userData.latitude,
            date: userData.date,
          },
        ];
        return res.status(200).send(resType);
      } else {
        resType["Message"] = "User's pin is not set in our Database";
        return res.status(400).send(resType);
      }
    } catch (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
  } else {
    resType["Message"] = "User's role is not set properly";
    return res.status(400).send(resType);
  }
});
// User Longitude & Latitude
router.post("/update-details", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  await userDetails.findByIdAndUpdate(
    { _id: req.body._id },
    { latitude: req.body.latitude, longitude: req.body.longitude },
    async (err, params) => {
      if (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      try {
        resType["Status"] = true;
        resType["Message"] = "Successful";
        resType["Data"] = [];
        return res.status(200).send(resType);
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
    }
  );
});
// User Device Info
router.post("/save-device-info", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  try {
    if (req.body.userid && req.body.msgid === "") {
      let deviceDetails = {};
      try {
        deviceDetails = await deviceInfo.findOne({
          userid: req.body.userid,
        });
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      if (!deviceDetails) {
        try {
          await deviceInfo.create({
            userid: req.body.userid,
            msgid: "",
            browser: req.body.browser,
            browser_version: req.body.browser_version,
            device: req.body.device,
            deviceType: req.body.deviceType,
            orientation: req.body.orientation,
            os: req.body.os,
            os_version: req.body.os_version,
            userAgent: req.body.userAgent,
            ip: req.body.ip,
          });
          resType["Message"] = "Successful";
          resType["Status"] = true;
          return res.status(200).send(resType);
        } catch (err) {
          resType["Message"] = err.message;
          return res.status(400).send(resType);
        }
      } else {
        if (deviceDetails.userAgent.includes("#")) {
          let userAgent = deviceDetails.userAgent.slice(
            0,
            deviceDetails.userAgent.lastIndexOf("#")
          );
          if (userAgent != req.body.userAgent) {
            try {
              await deviceInfo.updateMany({
                browser: deviceDetails.browser + "#" + req.body.browser,
                browser_version:
                  deviceDetails.browser_version +
                  "#" +
                  req.body.browser_version,
                device: deviceDetails.device + "#" + req.body.device,
                deviceType:
                  deviceDetails.deviceType + "#" + req.body.deviceType,
                orientation:
                  deviceDetails.orientation + "#" + req.body.orientation,
                os: deviceDetails.os + "#" + req.body.os,
                os_version:
                  deviceDetails.os_version + "#" + req.body.os_version,
                userAgent: deviceDetails.userAgent + "#" + req.body.userAgent,
                ip: deviceDetails.ip + "#" + req.body.ip,
              });
              resType["Message"] = "Successful";
              resType["Status"] = true;
              return res.status(200).send(resType);
            } catch (err) {
              resType["Message"] = err.message;
              return res.status(400).send(resType);
            }
          } else {
            resType["Message"] = "Device details is already Exist";
            resType["Status"] = true;
            return res.status(200).send(resType);
          }
        } else {
          if (deviceDetails.userAgent != req.body.userAgent) {
            try {
              await deviceInfo.updateMany({
                browser: deviceDetails.browser + "#" + req.body.browser,
                browser_version:
                  deviceDetails.browser_version +
                  "#" +
                  req.body.browser_version,
                device: deviceDetails.device + "#" + req.body.device,
                deviceType:
                  deviceDetails.deviceType + "#" + req.body.deviceType,
                orientation:
                  deviceDetails.orientation + "#" + req.body.orientation,
                os: deviceDetails.os + "#" + req.body.os,
                os_version:
                  deviceDetails.os_version + "#" + req.body.os_version,
                userAgent: deviceDetails.userAgent + "#" + req.body.userAgent,
              });
              resType["Message"] = "Successful";
              resType["Status"] = true;
              return res.status(200).send(resType);
            } catch (err) {
              resType["Message"] = err.message;
              return res.status(400).send(resType);
            }
          } else {
            resType["Message"] = "Device details is already Exist";
            resType["Status"] = true;
            return res.status(200).send(resType);
          }
        }
      }
    } else if (req.body.userid === "" && req.body.msgid) {
      let deviceDetails = {};
      try {
        deviceDetails = await deviceInfo.findOne({ msgid: req.body.msgid });
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      if (!deviceDetails) {
        try {
          await deviceInfo.create({
            userid: "",
            msgid: req.body.msgid,
            browser: req.body.browser,
            browser_version: req.body.browser_version,
            device: req.body.device,
            deviceType: req.body.deviceType,
            orientation: req.body.orientation,
            os: req.body.os,
            os_version: req.body.os_version,
            userAgent: req.body.userAgent,
          });
          resType["Message"] = "Successful";
          resType["Status"] = true;
          return res.status(200).send(resType);
        } catch (err) {
          resType["Message"] = err.message;
          return res.status(400).send(resType);
        }
      } else {
        try {
          await deviceInfo.updateMany({
            browser: deviceDetails.browser + "#" + req.body.browser,
            browser_version:
              deviceDetails.browser_version + "#" + req.body.browser_version,
            device: deviceDetails.device + "#" + req.body.device,
            deviceType: deviceDetails.deviceType + "#" + req.body.deviceType,
            orientation: deviceDetails.orientation + "#" + req.body.orientation,
            os: deviceDetails.os + "#" + req.body.os,
            os_version: deviceDetails.os_version + "#" + req.body.os_version,
            userAgent: deviceDetails.userAgent + "#" + req.body.userAgent,
          });
          resType["Message"] = "Successful";
          resType["Status"] = true;
          return res.status(200).send(resType);
        } catch (err) {
          resType["Message"] = err.message;
          return res.status(400).send(resType);
        }
      }
    }
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
// Change UserPin
// jwtTokenVerify.isAuthenticated,
router.post("/change-userpin", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  try {
    if (!req.body.userpin) {
      resType["Message"] = "User's Pin is Required";
      return res.status(400).send(resType);
    }
    if (!req.body.username) {
      resType["Message"] = "Username is Required";
      return res.status(400).send(resType);
    }
    if (
      req.body.userpin &&
      (req.body.userpin.length > 6 || req.body.userpin.length < 6)
    ) {
      resType["Message"] = "User's Pin should be Six length";
      return res.status(400).send(resType);
    }
    await userDetails.findOneAndUpdate(
      { username: req.body.username },
      { userpin: req.body.userpin },
      async (err, params) => {
        if (err) {
          resType["Message"] = err.message;
          return res.status(400).send(resType);
        }
        if (!params) {
          resType["Message"] = "Username is not valid";
          return res.status(400).send(resType);
        }
        resType["Message"] = "User's Pin is edited successfully";
        resType["Status"] = true;
        resType["Data"] = [{ userpin: req.body.userpin }];
        return res.status(200).send(resType);
      }
    );
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
// Save Firebase Push Endpoints
router.post("/save-firebase-endpoints", async (req, res) => {
  try {
    await firebasePush.findOne(
      { userid: req.body.userid },
      async (err, params) => {
        if (err) {
          return res.status(400).json({ Message: err.message });
        }
        if (req.body.endpoints != "" && req.body.userid != "") {
          if (params === null) {
            firebasePush.create({
              userid: req.body.userid,
              endpoints: req.body.endpoints,
            });
          } else {
            if (params.endpoints != req.body.endpoints) {
              params.endpoints = req.body.endpoints;
              await params.save();
            }
          }
        }
      }
    );
    return res.status(200).json({ Message: "Successful" });
  } catch (err) {
    return res.status(404).json({ Message: err.message });
  }
});
//SiteMap Details Save
router.post("/save-sitemap-details", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  if (!req.body.sitemapfor) {
    resType["Message"] = "Sitemap for which project is required!!";
    return res.status(400).send(resType);
  }
  if (!req.body.sitemap) {
    resType["Message"] = "Sitemap XML JSON is required!!";
    return res.status(400).send(resType);
  }
  try {
    await siteMap.findOne(
      { sitemapfor: req.body.sitemapfor },
      (err, params) => {
        if (err) {
          resType["Message"] = err.message;
          return res.status(400).send(resType);
        }
        if (
          params &&
          params["sitemapfor"] &&
          params["sitemapfor"] == req.body.sitemapfor
        ) {
          params["sitemap"] = req.body.sitemap;
          params.save();
        } else {
          siteMap.create({
            sitemapfor: req.body.sitemapfor,
            sitemap: req.body.sitemap,
            filename: req.body.filename,
            store1: req.body.store1,
            store2: req.body.store2,
          });
        }
        resType["Status"] = true;
        resType["Message"] = "Sitemap Details is Successfully Save";
        return res.status(200).send(resType);
      }
    );
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
// Get Love Percentage
router.post("/love-percentage", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  if (!req.body.uname) {
    resType["Message"] = "Your name is Required";
    return res.status(400).send(resType);
  }
  if (!req.body.crushname) {
    resType["Message"] = "Your Crush name is Required";
    return res.status(400).send(resType);
  }
  let commonChar = 0,
    uncommonChar = 0,
    sameChar = [],
    percentage;
  try {
    loveCrush.find({}, async (err, params) => {
      if (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      if (params && params.length > 0) {
        if (
          params.findIndex(
            (x) =>
              x.uname.toLowerCase() === req.body.uname.toLowerCase() &&
              x.crushname.toLowerCase() === req.body.crushname.toLowerCase()
          ) > -1
        ) {
          let index = params.findIndex(
            (x) =>
              x.uname.toLowerCase() === req.body.uname.toLowerCase() &&
              x.crushname.toLowerCase() === req.body.crushname.toLowerCase()
          );
          resType["Message"] = "Successful";
          resType["Status"] = true;
          resType["Data"] = params[index];
          return res.status(200).send(resType);
        } else if (
          params.findIndex(
            (x) =>
              x.uname.toLowerCase() === req.body.crushname.toLowerCase() &&
              x.crushname.toLowerCase() === req.body.uname.toLowerCase()
          ) > -1
        ) {
          let index = params.findIndex(
            (x) =>
              x.uname.toLowerCase() === req.body.crushname.toLowerCase() &&
              x.crushname.toLowerCase() === req.body.uname.toLowerCase()
          );
          resType["Message"] = "Successful";
          resType["Status"] = true;
          resType["Data"] = params[index];
          return res.status(200).send(resType);
        } else {
          // if (req.body.uname.includes(" ")) {
          req.body.uname
            .toLowerCase()
            .split("")
            .forEach((e) => {
              if (
                e != " " &&
                e != "" &&
                sameChar.findIndex((x) => x === e) === -1 &&
                req.body.crushname.split("").findIndex((x) => x === e) > -1
              ) {
                commonChar += 1;
                sameChar.push(e);
              }
            });
          uncommonChar = req.body.crushname.includes(" ")
            ? req.body.crushname.split(" ").join("").length +
              req.body.uname.split(" ").join("").length -
              commonChar
            : req.body.uname.split(" ").join("").length +
              req.body.crushname.length -
              commonChar;
          if (commonChar < 5) {
            percentage =
              commonChar * 20 + uncommonChar > 100
                ? commonChar * 20 +
                  Math.floor(
                    Math.random() *
                      (uncommonChar -
                        (commonChar * 20 + uncommonChar - 100) -
                        0 +
                        1) +
                      0
                  )
                : commonChar * 20 + uncommonChar;
          } else if (commonChar > 5) {
            percentage =
              commonChar * 10 + uncommonChar > 100
                ? commonChar * 10 +
                  Math.floor(
                    Math.random() *
                      (uncommonChar -
                        (commonChar * 10 + uncommonChar - 100) -
                        0 +
                        1) +
                      0
                  )
                : commonChar * 10 + uncommonChar;
          } else if (commonChar === 5) {
            percentage = commonChar * 20;
          }
          // }
          if (percentage > 100) {
            percentage = 100;
          }
          resType["Data"] = await loveCrush.create({
            uname: req.body.uname,
            crushname: req.body.crushname,
            percentage: percentage,
          });
          resType["Status"] = true;
          resType["Message"] = "Successful";
          return res.status(200).send(resType);
        }
      } else {
        // if (req.body.uname.includes(" ")) {
        req.body.uname
          .toLowerCase()
          .split("")
          .forEach((e) => {
            if (
              e != " " &&
              e != "" &&
              sameChar.findIndex((x) => x === e) === -1 &&
              req.body.crushname.split("").findIndex((x) => x === e) > -1
            ) {
              commonChar += 1;
              sameChar.push(e);
            }
          });
        uncommonChar = req.body.crushname.includes(" ")
          ? req.body.crushname.split(" ").join("").length +
            req.body.uname.split(" ").join("").length -
            commonChar
          : req.body.uname.split(" ").join("").length +
            req.body.crushname.length -
            commonChar;
        if (commonChar < 5) {
          percentage =
            commonChar * 20 + uncommonChar > 100
              ? commonChar * 20 +
                Math.floor(
                  Math.random() *
                    (uncommonChar -
                      (commonChar * 20 + uncommonChar - 100) -
                      0 +
                      1) +
                    0
                )
              : commonChar * 20 + uncommonChar;
        } else if (commonChar > 5) {
          percentage =
            commonChar * 10 + uncommonChar > 100
              ? commonChar * 10 +
                Math.floor(
                  Math.random() *
                    (uncommonChar -
                      (commonChar * 10 + uncommonChar - 100) -
                      0 +
                      1) +
                    0
                )
              : commonChar * 10 + uncommonChar;
        } else if (commonChar === 5) {
          percentage = commonChar * 20;
        }
        if (percentage > 100) {
          percentage = 100;
        }
        // }
        resType["Data"] = await loveCrush.create({
          uname: req.body.uname,
          crushname: req.body.crushname,
          percentage: percentage,
        });
        resType["Status"] = true;
        resType["Message"] = "Successful";
        return res.status(200).send(resType);
      }
    });
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
router.post("/signup-admin", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (!req.body.uname) {
    resType["Message"] = "Username is Required !";
    return res.status(400).send(resType);
  }
  if (!req.body.password) {
    resType["Message"] = "Password is Required !";
    return res.status(400).send(resType);
  }
  if (req.body.password && req.body.password.length < 6) {
    resType["Message"] = "Password length is less than 6";
    return res.status(400).send(resType);
  }
  if (req.body.password && !format.test(req.body.password)) {
    resType["Message"] = "Password has not includes any Special Character";
    return res.status(400).send(resType);
  }
  if (
    req.body.password &&
    req.body.password == req.body.password.toLowerCase()
  ) {
    resType["Message"] = "Password has no Uppercase";
    return res.status(400).send(resType);
  }
  if (req.body.password && req.body.password.includes(" ")) {
    resType["Message"] = "No Space will be present in Password";
    return res.status(400).send(resType);
  }
  await adminUser.findOne({ uname: req.body.uname }, async (err, params) => {
    if (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
    try {
      if (params && params != null) {
        resType["Message"] = "Username is Available";
        return res.status(400).send(resType);
      } else {
        resType["Data"] = await adminUser.create({
          uname: req.body.uname,
          password: Buffer.from(req.body.password).toString("base64"),
        });
        resType["Status"] = true;
        resType["Message"] = "Successful";
        return res.status(200).send(resType);
      }
    } catch (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
  });
});
router.post("/login-admin", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  if (!req.body.uname) {
    resType["Message"] = "Username is Required !";
    return res.status(400).send(resType);
  }
  if (!req.body.password) {
    resType["Message"] = "Password is Required !";
    return res.status(400).send(resType);
  }
  await adminUser.findOne({ uname: req.body.uname }, async (err, params) => {
    if (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
    try {
      if (params && params != null) {
        if (
          Buffer.from(params.password, "base64").toString() ===
          req.body.password
        ) {
          resType["Data"] = [{ admin: params["uname"], date: params["date"] }];
          resType["Status"] = true;
          resType["Message"] = "Login Successful";
          return res.status(200).send(resType);
        } else {
          resType["Message"] = "Password is Incorrect";
          return res.status(400).send(resType);
        }
      } else {
        resType["Message"] = "Username is Incorrect";
        return res.status(400).send(resType);
      }
    } catch (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
  });
});
router.post("/edit-love-calculator", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  if (!req.body._id) {
    resType["Message"] = "Id is Required";
    return res.status(400).send(resType);
  }
  if (!req.body.uname) {
    resType["Message"] = "Your name is Required";
    return res.status(400).send(resType);
  }
  if (!req.body.crushname) {
    resType["Message"] = "Your Crush name is Required";
    return res.status(400).send(resType);
  }
  await loveCrush.findOneAndUpdate(
    { _id: req.body._id },
    {
      uname: req.body.uname,
      crushname: req.body.crushname,
      percentage: req.body.percentage,
    },
    (err, params) => {
      if (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      try {
        if (params && params != null) {
          resType["Status"] = true;
          resType["Message"] = "Successful";
          return res.status(200).send(resType);
        }
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
    }
  );
});
router.post("/add-qna-dare", async (req, res) => {
  var resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  if (!req.body.qna) {
    resType["Message"] = "No Question & Answer Found";
    return res.status(400).send(resType);
  }
  req.body.qna.forEach((x) => {
    if (
      x.question === "" ||
      (x.answers && x.answers.length === 0) ||
      x.answers[0] === "" ||
      x.answers[1] === "" ||
      x.answers[2] === "" ||
      x.answers[3] === ""
    ) {
      resType["Message"] = "Please Fill All the Fields";
      return res.status(400).send(resType);
    }
  });
  if (!req.body.qna[0]._id) {
    req.body.qna.forEach(async (x) => {
      try {
        if (x.question != "" || x.answers != []) {
          await dareDetails.findOne(
            { question: x.question },
            async (err, params) => {
              if (err) {
                resType["Message"] = err.message;
                return res.status(400).send(resType);
              }
              try {
                if (params && params != null) {
                  params["question"] = x.question;
                  params["answers"] = x.answers;
                  params["available"] = x.available;
                  await params.save();
                } else {
                  await dareDetails.create({
                    question: x.question,
                    answers: x.answers,
                    available: x.available,
                  });
                }
              } catch (err) {
                resType["Message"] = err.message;
                return res.status(400).send(resType);
              }
            }
          );
        }
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
    });
    try {
      resType["Message"] = "Successful";
      resType["Status"] = true;
      return res.status(200).send(resType);
    } catch (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
  } else {
    await dareDetails.findByIdAndUpdate(
      req.body.qna[0]._id,
      {
        question: req.body.qna[0].question,
        answers: req.body.qna[0].answers,
        available: req.body.qna[0].available,
      },
      (err, params) => {
        if (err) {
          resType["Message"] = err.message;
          return res.status(400).send(resType);
        }
        if (params && params != null) {
          resType["Message"] = "Successful";
          resType["Status"] = true;
          return res.status(200).send(resType);
        }
      }
    );
  }
});
// Signup Dare Games User
router.post("/save-dare-user", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  if (!req.body.username) {
    resType["Message"] = "User's Name is Required";
    return res.status(400).send(resType);
  }
  if (!req.body.role) {
    resType["Message"] = "User's Role is Required";
    return res.status(400).send(resType);
  }
  try {
    let checkname = req.body.username.split(" ").join("");
    const prevData = await dareUsers.findOne({ username: checkname });
    if (prevData) {
      let username = "";
      if (req.body.username.includes(" ")) {
        username =
          req.body.username.split(" ").join("") +
          Math.random().toString(36).substring(7);
      } else {
        username = req.body.username + Math.random().toString(36).substring(7);
      }
      const afterUserNameSet = await dareUsers.findOne({
        username: username,
      });
      if (afterUserNameSet) {
        // let username = "";
        if (req.body.username.includes(" ")) {
          username =
            req.body.username.split(" ").join("") +
            Math.random().toString(36).substring(7);
        } else {
          username =
            req.body.username + Math.random().toString(36).substring(7);
        }
      }
      const token = jwt.sign(
        { _id: username, role: req.body.role },
        process.env.TOKEN_SECRET,
        {
          issuer: "unimansyst@gmail.com",
          audience: username,
        }
      );
      const saveDetails = new dareUsers({
        username: username,
        displayname: req.body.username,
        role: req.body.role,
        token: token,
        link: "dare-games/share-link/" + btoa(username),
        encyptduser: btoa(username),
        userpin: (Math.random() * 1000000).toFixed(),
        longitude: "",
        latitude: "",
      });
      try {
        resType[
          "Message"
        ] = `${saveDetails.displayname} is Register Successfully`;
        resType["Status"] = true;
        resType["Data"] = [await saveDetails.save()];
        return res.status(200).send(resType);
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
    } else {
      let username = "";
      if (req.body.username.includes(" ")) {
        username = req.body.username.split(" ").join("");
      } else {
        username = req.body.username;
      }
      const token = jwt.sign(
        { _id: username, role: req.body.role },
        process.env.TOKEN_SECRET,
        {
          issuer: "sayonchakraborty1998@gmail.com",
          audience: username,
        }
      );
      const saveDetails = new dareUsers({
        username: username,
        displayname: req.body.username,
        role: req.body.role,
        token: token,
        link: "dare-games/share-link/" + btoa(username),
        encyptduser: btoa(username),
        userpin: (Math.random() * 1000000).toFixed(),
        longitude: "",
        latitude: "",
      });
      try {
        resType[
          "Message"
        ] = `${saveDetails.displayname} is Register Successfully`;
        resType["Status"] = true;
        resType["Data"] = [await saveDetails.save()];
        return res.status(200).send(resType);
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
    }
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
// Dare Games User id with Question and Answers
router.post("/daregames-user-questions-answers", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  if (!req.body.userid) {
    resType["Message"] = "User's Id is Required";
    return res.status(400).send(resType);
  }
  if (
    req.body.questionid_and_answer &&
    req.body.questionid_and_answer.length <= 0
  ) {
    resType["Message"] = "User's Question and Answer is Required";
    return res.status(400).send(resType);
  }
  dareQnAUser.findOne({ userid: req.body.userid }, async (err, params) => {
    if (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
    try {
      if (params === null) {
        resType["Data"] = await dareQnAUser.create({
          userid: req.body.userid,
          question_and_answer: req.body.questionid_and_answer,
        });
        resType["Message"] = "Successful";
        resType["Status"] = true;
        return res.status(200).send(resType);
      } else {
        params["question_and_answer"] = req.body.questionid_and_answer;
        resType["Data"] = await params.save();
        resType["Message"] = "Updated Successfully";
        resType["Status"] = true;
        return res.status(200).send(resType);
      }
    } catch (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
  });
});
// Dare Games save value of annonymous user
router.post("/daregames-annoymouse-user-value", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  if (!req.body.annonyUser) {
    resType["Message"] = "User Details is Required";
    return res.status(400).send(resType);
  }
  if (!req.body.userid) {
    resType["Message"] = "User's Id' is Required";
    return res.status(400).send(resType);
  }
  await dareQnAUser.findOne(
    { userid: req.body.userid },
    async (err, params) => {
      if (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      try {
        if (params != null) {
          params["annonyUser"].push(req.body.annonyUser);
          resType["Data"] = await params.save();
          resType["Status"] = true;
          resType["Message"] = "Successful";
          return res.status(200).send(resType);
        } else {
          resType["Message"] = "User Details is not Present";
          return res.status(400).send(resType);
        }
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
    }
  );
});
module.exports = router;
