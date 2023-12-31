require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/db");

const app = express();
const allowedOrigins = [
  "http://localhost:5000",
  "https://localhost:5000",
  "http://accessify.netlify.app",
  "https://accessify.netlify.app",
  "*",
];
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
