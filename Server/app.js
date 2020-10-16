const express = require("express");
const myroutes = require("./routes");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());

// parse application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", myroutes);

app.use((err, req, res, next) => {
  // Do logging and user-friendly error message display
  console.error(err);
  res.status(500).send("internal server error");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
