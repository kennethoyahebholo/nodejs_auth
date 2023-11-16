const express = require("express");
const router = express.Router();

const userRoutes = require("./../domains/user");
const forgetPasswordRoutes = require("./../domains/forgot_password");
const userVerificationRoutes = require("./../domains/user_verification");

router.use("/user", userRoutes);
router.use("/user", forgetPasswordRoutes);
router.use("/user", userVerificationRoutes);

module.exports = router;
