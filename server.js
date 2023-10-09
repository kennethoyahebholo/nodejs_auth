require("./config/db");
require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.port || 3000;

const UserRouter = require("./api/User");

// Use express.json() as middleware to parse JSON request bodies
app.use(express.json());
app.use("/user", UserRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
