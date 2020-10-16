const express = require("express");
const router = express.Router();

const { NotificationPusher } = require("./pushnotifications");

router.post("/", async (req, res) => {
  try {
    let pusher = new NotificationPusher();

    pusher.sendNotification(req.body.content, req.body.userToken, res);
  } catch (err) {
    console.log(err.stack);
    res.status(500).send("POST FAILED - internal server error");
  }
});

module.exports = router;
