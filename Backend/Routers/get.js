const router = require("express").Router();
const jwtTokenVerify = require("../Service/jwt-token-verify");
const messages = require("../Models/messages");
const userDetails = require("../Models/user-details");
const firebasePush = require("../Models/firebase-push-details");
const lovecrush = require("../Models/love-crush");
const dareDetails = require("../Models/dare-details");
const dareQnAUser = require("../Models/dare-question-with-user");
const dareUser = require("../Models/dare-users");
//Secret Message Details By Username
router.get("/message-details/:_id", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  try {
    await messages.findOne({ userid: req.params._id }, async (err, params) => {
      if (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      if (params === null) {
        resType["Status"] = true;
        resType["Message"] = "You have no message yet";
        return res.status(200).send(resType);
      }
      if (params.messagedetails.findIndex((x) => x.seen == false) > -1) {
        var arrayData = [];
        arrayData = params.messagedetails;
        params.messagedetails = [];
        arrayData.forEach(async (element) => {
          await params.messagedetails.push({
            message: element.message,
            date: element.date,
            seen: true,
            base64image: element.base64image,
            longitude: element.longitude,
            latitude: element.latitude,
            browser: element.browser,
            browser_version: element.browser_version,
            device: element.device,
            deviceType: element.deviceType,
            orientation: element.orientation,
            os: element.os,
            os_version: element.os_version,
            userAgent: element.userAgent,
            ip: element.ip,
          });
        });
        await params.save();
      }
      resType["Status"] = true;
      resType["Message"] = "Successful";
      resType["Data"] = [params];
      return res.status(200).send(resType);
    });
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
// Secret Message Users
router.get("/secret-message-user-details", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  await userDetails.find({}, async (err, params) => {
    if (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
    try {
      if (params === null) {
        resType["Message"] = "You have no user yet";
        return res.status(400).send(resType);
      }
      if (!req.query.currentpage || req.query.currentpage == 0) {
        resType["Message"] = "Current Page is Required and it can not be Zero";
        return res.status(400).send(resType);
      }
      if (!req.query.pagelimit || req.query.pagelimit == 0) {
        resType["Message"] = "Page limit is Required and it can not be Zero";
        return res.status(400).send(resType);
      }
      var startIndex = (req.query.currentpage - 1) * req.query.pagelimit;
      var messageDetails = [];
      for (
        let i = startIndex;
        i <= req.query.pagelimit * req.query.currentpage - 1;
        i++
      ) {
        if (params[i]) {
          messageDetails.push(params[i]);
        } else {
          break;
        }
      }
      if (messageDetails && messageDetails.length > 0) {
        resType["Message"] = "Successful";
        resType["Data"] = messageDetails;
        resType["Count"] = params.length;
        resType["Status"] = true;
        return res.status(200).send(resType);
      } else {
        resType["Message"] = "No User is Found";
        return res.status(400).send(resType);
      }
    } catch (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
  });
});
// Secret Message Username is available or not
router.get("/search-user/:searchdata", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  try {
    await userDetails.find({}, async (err, params) => {
      if (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      if (params.findIndex((x) => x.username == req.params.searchdata) != -1) {
        resType["Message"] = "Username is not available";
        return res.status(400).send(resType);
      }
      try {
        resType["Status"] = true;
        resType["Message"] = "Username is available";
        return res.status(200).send(resType);
      } catch (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
    });
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
// Secret Message User Details
router.get("/user-details/:username", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  // const userName = req.userNameFromJWT;
  try {
    await userDetails.findOne(
      { username: req.params.username },
      async (err, params) => {
        if (err) {
          resType["Message"] = err.message;
          return res.status(400).send(resType);
        }
        if (!params) {
          resType["Message"] = "User is not Registered";
          return res.status(200).send(resType);
        }
        await firebasePush.findOne({ userid: params._id }, async (err, fcm) => {
          if (err) {
            resType["Message"] = err.message;
            return res.status(400).send(resType);
          }
          if (fcm !== null) {
            resType["Data"] = [params, { endpoints: fcm.endpoints }];
          } else {
            resType["Data"] = [params, { endpoints: "" }];
          }
          resType["Message"] = "Successful";
          resType["Status"] = true;
          return res.status(200).send(resType);
        });
      }
    );
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
// All Site map Links
router.get("/all-sitemap-links", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  try {
    await userDetails.find({}, async (err, params) => {
      if (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      if (params) {
        let sitemapArray = [];
        params.forEach((element) => {
          if (element.link.includes("secret-message/share-link/")) {
            sitemapArray.push({ url: element.link });
          }
        });
        await dareUser.find({}, (err, params) => {
          if (err) {
            resType["Message"] = err.message;
            return res.status(400).send(resType);
          }
          if (params) {
            params.forEach((element) => {
              if (element.link.includes("dare-games/share-link/")) {
                sitemapArray.push({ url: element.link });
              }
            });
          }
        });
        resType["Message"] = "Successful";
        resType["Status"] = true;
        resType["Data"] = sitemapArray;
        return res.status(200).send(resType);
      }
    });
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
// Love-Crush Users
router.get("/flames-users", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  await lovecrush.find({}, (err, params) => {
    if (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
    try {
      if (params === null) {
        resType["Message"] = "You have no user yet";
        return res.status(400).send(resType);
      }
      if (!req.query.currentpage || req.query.currentpage == 0) {
        resType["Message"] = "Current Page is Required and it can not be Zero";
        return res.status(400).send(resType);
      }
      if (!req.query.pagelimit || req.query.pagelimit == 0) {
        resType["Message"] = "Page limit is Required and it can not be Zero";
        return res.status(400).send(resType);
      }
      var startIndex = (req.query.currentpage - 1) * req.query.pagelimit;
      var loveCrushDetails = [];
      for (
        let i = startIndex;
        i <= req.query.pagelimit * req.query.currentpage - 1;
        i++
      ) {
        if (params[i]) {
          loveCrushDetails.push(params[i]);
        } else {
          break;
        }
      }
      if (loveCrushDetails && loveCrushDetails.length > 0) {
        resType["Message"] = "Successful";
        resType["Data"] = loveCrushDetails;
        resType["Count"] = params.length;
        resType["Status"] = true;
        return res.status(200).send(resType);
      } else {
        resType["Message"] = "No User is Found";
        return res.status(400).send(resType);
      }
    } catch (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
  });
});
//Dare-Details
router.get("/dare-details", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  await dareDetails.find({}, (err, params) => {
    if (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
    try {
      if (params && params != null) {
        params.forEach((x) => {
          resType["Data"].push({
            _id: x._id,
            question: x.question,
            answers: x.answers,
            available: x.available,
            date: x.date,
            disabled: true,
          });
        });
        resType["Message"] = "Successful";
        resType["Status"] = true;
        return res.status(200).send(resType);
      }
    } catch (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
  });
});
// Get Dare User Details
router.get("/dare-user-details/:username", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  dareUser.findOne(
    { username: Buffer.from(req.params.username, "base64").toString("binary") },
    async (err, params) => {
      if (err) {
        resType["Message"] = err.message;
        return res.status(400).send(resType);
      }
      try {
        if (params === null) {
          resType["Message"] = "User is not Available";
          return res.status(200).send(resType);
        } else {
          resType["Data"] = [params];
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
// Dare Games User Q n A Details
router.get("/qna-by-userid/:userid", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  dareQnAUser.findOne({ userid: req.params.userid }, async (err, params) => {
    if (err) {
      resType["Message"] = err.message;
      return res.status(400).send(resType);
    }
    try {
      if (params === null) {
        resType["Status"] = true;
        resType["Message"] = "Successful";
        return res.status(200).send(resType);
      } else {
        resType["Data"] = [params];
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
// Admin Total User Details
router.get("/get-total-userdetails", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  var secretGames = [],
    dareGames = [],
    loveCrush = [];
  secretGames = await userDetails.find({});
  dareGames = await dareUser.find({});
  loveCrush = await lovecrush.find({});
  try {
    resType["Data"] = [
      {
        title: "Secret Games",
        sub_title: "Total User Registered",
        users: secretGames ? secretGames.length : 0,
        router_link: "/pages/secret-messages",
      },
      {
        title: "Dare Games",
        sub_title: "Total User Registered",
        users: dareGames ? dareGames.length : 0,
        router_link: "/pages/dare-games",
      },
      {
        title: "Love Calculator",
        sub_title: "Total User Registered",
        users: loveCrush ? loveCrush.length : 0,
        router_link: "/pages/love-calculator",
      },
    ];
    resType["Message"] = "Successful";
    resType["Status"] = true;
    return res.status(200).send(resType);
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
// Admin Total User Details by Year
router.get("/get-userdetails-by-year/:year", async (req, res) => {
  const resType = {
    Status: false,
    Data: [],
    Message: "",
  };
  var secretGames = [],
    dareGames = [],
    loveCrush = [],
    secretGamesYear = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    dareGamesYear = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    loveCrushYear = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    yearArray = [];
  secretGames = await userDetails.find({});
  dareGames = await dareDetails.find({});
  loveCrush = await lovecrush.find({});
  try {
    secretGames.forEach((x) => {
      if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 0
      ) {
        secretGamesYear[0] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 1
      ) {
        secretGamesYear[1] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 2
      ) {
        secretGamesYear[2] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 3
      ) {
        secretGamesYear[3] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 4
      ) {
        secretGamesYear[4] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 5
      ) {
        secretGamesYear[5] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 6
      ) {
        secretGamesYear[6] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 7
      ) {
        secretGamesYear[7] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 8
      ) {
        secretGamesYear[8] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 9
      ) {
        secretGamesYear[9] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 10
      ) {
        secretGamesYear[10] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 11
      ) {
        secretGamesYear[11] += 1;
      }
      if (
        yearArray.findIndex((y) => y === new Date(x.date).getFullYear()) === -1
      ) {
        yearArray.push(new Date(x.date).getFullYear());
      }
    });
    dareGames.forEach((x) => {
      if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 0
      ) {
        dareGamesYear[0] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 1
      ) {
        dareGamesYear[1] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 2
      ) {
        dareGamesYear[2] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 3
      ) {
        dareGamesYear[3] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 4
      ) {
        dareGamesYear[4] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 5
      ) {
        dareGamesYear[5] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 6
      ) {
        dareGamesYear[6] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 7
      ) {
        dareGamesYear[7] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 8
      ) {
        dareGamesYear[8] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 9
      ) {
        dareGamesYear[9] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 10
      ) {
        dareGamesYear[10] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 11
      ) {
        dareGamesYear[11] += 1;
      }

      if (
        yearArray.findIndex((y) => y === new Date(x.date).getFullYear()) === -1
      ) {
        yearArray.push(new Date(x.date).getFullYear());
      }
    });
    loveCrush.forEach((x) => {
      if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 0
      ) {
        loveCrushYear[0] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 1
      ) {
        loveCrushYear[1] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 2
      ) {
        loveCrushYear[2] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 3
      ) {
        loveCrushYear[3] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 4
      ) {
        loveCrushYear[4] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 5
      ) {
        loveCrushYear[5] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 6
      ) {
        loveCrushYear[6] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 7
      ) {
        loveCrushYear[7] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 8
      ) {
        loveCrushYear[8] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 9
      ) {
        loveCrushYear[9] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 10
      ) {
        loveCrushYear[10] += 1;
      } else if (
        new Date(x.date).getFullYear() === Number(req.params.year) &&
        new Date(x.date).getMonth() === 11
      ) {
        loveCrushYear[11] += 1;
      }

      if (
        yearArray.findIndex((y) => y === new Date(x.date).getFullYear()) === -1
      ) {
        yearArray.push(new Date(x.date).getFullYear());
      }
    });
    var config = {
      type: "line",
      data: {
        labels: [
          // Date Objects
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        datasets: [
          {
            label: "Secret Message",
            backgroundColor: "blue",
            borderColor: "yellow",
            fill: false,
            data: secretGamesYear,
          },
          {
            label: "Dare Games",
            backgroundColor: "red",
            borderColor: "green",
            fill: false,
            data: dareGamesYear,
          },
          {
            label: "Love Calculator",
            backgroundColor: "pink",
            borderColor: "white",
            fill: false,
            data: loveCrushYear,
          },
        ],
      },
    };
    resType["Data"] = { config: config, year: yearArray };
    resType["Message"] = "Successful";
    resType["Status"] = true;
    return res.status(200).send(resType);
  } catch (err) {
    resType["Message"] = err.message;
    return res.status(400).send(resType);
  }
});
module.exports = router;
