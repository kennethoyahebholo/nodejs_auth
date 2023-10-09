require("./config/db");

const express = require("express");
const app = express();
const port = 3000;

const UserRouter = require("./api/User");

// Use express.json() as middleware to parse JSON request bodies
app.use(express.json());
app.use("/user", UserRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
