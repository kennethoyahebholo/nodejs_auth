const express = require("express");
const router = express.Router();

const userRoutes = require("./../domains/user");
const forgetPasswordRoutes = require("./../domains/forgot_password");
const userVerificationRoutes = require("./../domains/email_verification");

router.use("/user", userRoutes);
router.use("/forgot_password", forgetPasswordRoutes);
router.use("/email_verification", userVerificationRoutes);

module.exports = router;
