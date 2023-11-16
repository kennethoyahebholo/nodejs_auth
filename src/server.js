require("dotenv").config();
require("./config/db");

const express = require("express");
const app = express();
const cors = require("cors");
const allowedOrigins = ["http://localhost:5000", "https://localhost:5000"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
const routes = require("./routes");
// Use express.json() as middleware to parse JSON request bodies
app.use(express.json());
app.use(routes);

module.exports = app;
