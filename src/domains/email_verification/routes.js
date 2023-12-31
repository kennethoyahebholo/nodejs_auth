require("dotenv").config();
const express = require("express");
const router = express.Router();

const { handleUserVerification } = require("./controller");

// verify email
router.get("/verify/:userId/:uniqueString", async (req, res) => {
  const clientUrl = process.env.CLIENT_URL;
  try {
    let { userId, uniqueString } = req.params;
    await handleUserVerification(userId, uniqueString, clientUrl, res);
  } catch (err) {
    let message =
      "An error has occurred while checking for existing user verification record";
    res.redirect(`${clientUrl}auth/verified?error=true&message=${message}`);
  }
});

module.exports = router;
