const express = require("express");
const router = express.Router();

const userRoutes = require("./../domains/user");
const forgetPasswordRoutes = require("./../domains/forgot_password");
const userVerification = require("./../domains/user_verification");

router.use("/user", userRoutes, forgetPasswordRoutes, userVerification);

module.exports = router;
