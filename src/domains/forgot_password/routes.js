const express = require("express");
const router = express.Router();

const {
  sendEmailForPasswordReset,
  handlePasswordReset,
} = require("./controller");

// Password Reset
router.post("/requestPasswordReset", async (req, res) => {
  try {
    let { email, redirectUrl } = req.body;
    email = email.trim();
    redirectUrl = redirectUrl.trim();

    if (email === "" || redirectUrl === "") {
      throw Error("Empty Input Fields!");
    } else {
      await sendEmailForPasswordReset(email, redirectUrl);
      res.json({
        status: "PENDING",
        message: "Password reset email sent",
      });
    }
  } catch (err) {
    res.json({
      status: "FAILED",
      message: err.message,
    });
  }
});

//actually reset the password
router.post("/resetPassword", async function (req, res) {
  try {
    let { userId, resetString, newPassword } = req.body;
    userId = userId.trim();
    resetString = resetString.trim();
    newPassword = newPassword.trim();
    if (userId === "" || resetString === "" || newPassword === "") {
      throw Error("Empty Input Fields!");
    } else if (newPassword.length < 8) {
      throw Error("Password is too short!");
    } else {
      await handlePasswordReset(userId, resetString, newPassword);
      res.json({
        success: "SUCCESS",
        message: "Password has been updated successfully",
      });
    }
  } catch (err) {
    res.json({
      status: "FAILED",
      message: err.message,
    });
  }
});

module.exports = router;
