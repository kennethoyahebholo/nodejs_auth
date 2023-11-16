const { v4: uuidv4 } = require("uuid");
const express = require("express");
const router = express.Router();

const {
  checkForExistingUser,
  sendResetEmail,
  handlePasswordReset,
} = require("./controller");

// Password Reset
router.post("/requestPasswordReset", async (req, res) => {
  try {
    let { email, redirectUrl } = req.body;
    // email = email.trim();
    // redirectUrl = phoneNumber.trim();
    // if (email === "" || redirectUrl === "") {
    //   throw Error("Empty Input Fields!");
    // } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    //   throw Error("Invalid email entered");
    // } else {
    // const resetString = uuidv4() + _id;
    // const existingUser = await checkForExistingUser(email);

    // if (!existingUser.isVerified) {
    //   res.json({
    //     status: "FAILED",
    //     message: "Email hasn't been verified yet, check you inbox",
    //   });
    // } else {
    //   await sendResetEmail(existingUser[0], redirectUrl, resetString);
    //   res.json({
    //     status: "PENDING",
    //     message: "Password reset email sent",
    //   });
    // }
    res.json({
      status: "PENDING",
      message: "Password reset email sent",
      email,
      redirectUrl,
      // id: resetString,
    });
    // }
  } catch (err) {
    res.json({
      status: "FAILED",
      message: "failed to reset password",
    });
  }
});

//actually reset the password
router.post("/resetPassword", async function (req, res) {
  let { userId, resetString, newPassword } = req.body;
  try {
    await handlePasswordReset(userId, resetString, newPassword);
    res.json({
      success: "SUCCESS",
      message: "Password has been updated successfully",
    });
  } catch (err) {
    res.json({
      status: "FAILED",
      message: err.message,
    });
  }
});

module.exports = router;
