require("./config/db");
require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.port || 5000;

//cors
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

const UserRouter = require("./api/User");

// Use express.json() as middleware to parse JSON request bodies
app.use(express.json());
app.use("/user", UserRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
