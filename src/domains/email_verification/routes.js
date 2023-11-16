require("dotenv").config();
const express = require("express");
const router = express.Router();

const { handleUserVerification } = require("./controller");

const clientUrl = process.env.CLIENT_URL;

// verify email
router.get("/verify/:userId/:uniqueString", async (req, res) => {
  try {
    let { userId, uniqueString } = req.params;
    await handleUserVerification(userId, uniqueString, clientUrl);
  } catch (err) {
    let message =
      "An error has occurred while checking for existing user verification record";
    res.redirect(`${clientUrl}auth/verified?error=true&message=${message}`);
  }
});

module.exports = router;
