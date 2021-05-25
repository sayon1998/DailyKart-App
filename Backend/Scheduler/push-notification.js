const router = require("express").Router();
const cron = require("node-cron");
const axios = require("axios");
const messages = require("../Models/messages");
const firebase = require("../Models/firebase-push-details");
// 0 */1 * * * * --> Stands for 1 min
const task = cron.schedule(
  "0 */10 * * * *",
  async () => {
    console.log("running a task every minute");
    await messages.find({}, async (err, params) => {
      if (err) {
        return;
      }
      if (params !== null) {
        params.forEach(async (element, index) => {
          if (element.messagedetails.findIndex((x) => x.seen === false) > -1) {
            await firebase.findOne(
              { userid: element.userid },
              async (err, fcm) => {
                if (err) {
                  return;
                }
                // if (fcm !== null) {
                //   await axios
                //     .post(
                //       process.env.FIREBASE_CLOUD_MESSAGE_URL,
                //       {
                //         notification: {
                //           title: "Social Message",
                //           body:
                //             "check anonymously someone messaged you something",
                //           icon:
                //             "https://res.cloudinary.com/dzruu87x0/image/upload/v1612033640/secret-message_lgicit.png",
                //           click_action:
                //             "https://socail-game.web.app/secret-message/create",
                //         },
                //         registration_ids: fcm.endpoints,
                //       },
                //       {
                //         headers: {
                //           "Access-Control-Allow-Origin": "*",
                //           "Content-type": "application/json",
                //           Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
                //         },
                //       }
                //     )
                //     .then(
                //       (response) => {
                //         var response = response.data;
                //         console.log(response);
                //       },
                //       (error) => {
                //         var status = error.response.status;
                //         console.log(status);
                //       }
                //     );
                // }
              }
            );
          }
        });
      }
    });
  },
  {
    scheduled: false,
  }
);

// task.start();
module.exports = router;
