// https://github.com/expo/expo-server-sdk-node
const { Expo } = require("expo-server-sdk");
const sizeof = require("object-sizeof");

const { admin, db } = require("./firebase");

class NotificationPusher {
  constructor() {
    this.expo = new Expo();
  }

  sendNotification(content, userToken, response) {
    admin
      .auth()
      .verifyIdToken(userToken)
      .then(decoded => {
        let uid = decoded.uid;
        db.collection("users")
          .doc(uid)
          .get()
          .then(doc => {
            if (doc.exists) {
              let pushToken = doc.data().pushToken;

              let payload = { content: content };

              // Check that all your push tokens appear to be valid Expo push tokens
              if (!Expo.isExpoPushToken(pushToken)) {
                response.status(500).send({
                  errorMessage: `The push token saved for your app is invalid. Try signing out then back into the DeskTexter app on your phone and try again.`
                });
              } else if (sizeof(payload) > 4096) {
                // max payload size is 4Kib
                response.status(500).send({
                  errorMessage: `Sorry, the content you are trying to share is too big.`
                });
              } else {
                // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications)
                // Needs to be stored in an array to work with expo functions
                let message = [
                  {
                    to: pushToken,
                    sound: "default",
                    title: "Content Received!",
                    body: "Tap here to open the app, then share.",
                    data: payload,
                    channelId: "desktexter",
                    _displayInForeground: true
                  }
                ];

                let ticket = null;
                (async () => {
                  try {
                    ticket = await this.expo.sendPushNotificationsAsync(
                      message
                    );

                    if (ticket[0].status === "ok") {
                      response.status(200).send();
                    } /* error */ else {
                      if (
                        ticket[0].details &&
                        ticket[0].details.error === "DeviceNotRegistered"
                      ) {
                        response.status(500).send({
                          errorMessage:
                            "It looks like you have disabled notifications for DeskTexter on your phone or deleted the app."
                        });

                        // If this error happens, delete the entry for the user in firestore so we don't try to send any notifications to this user again, unless they reregister
                        db.collection("users").doc(uid).delete();
                      } else {
                        response.status(500).send({
                          errorMessage: "Content failed to send."
                        });
                      }
                    }
                  } catch (error) {
                    response
                      .status(500)
                      .send({ errorMessage: "Content failed to send." });
                  }
                })();
              }
            } else {
              response.status(500).send({
                errorMessage: `Please install the DeskTexter app on your phone and log in with the same account you used to log in here.`
              });
            }
          });
      });
  }
}

module.exports = {
  NotificationPusher
};
