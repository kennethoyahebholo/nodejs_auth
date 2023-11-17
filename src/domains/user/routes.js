const express = require("express");
const router = express.Router();

//custom functions
const { createUser, authenticateUser, getAllUsers } = require("./controller");
const { sendVerificationEmail } = require("../email_verification/controller");

// sign up
router.post("/signup", async (req, res) => {
  try {
    let { firstName, lastName, email, phoneNumber, dateOfBirth, password } =
      req.body;
    firstName = firstName.trim();
    lastName = lastName.trim();
    email = email.trim();
    phoneNumber = phoneNumber.trim();
    dateOfBirth = dateOfBirth.trim();
    password = password.trim();

    if (
      firstName === "" ||
      lastName === "" ||
      email === "" ||
      phoneNumber === "" ||
      dateOfBirth === "" ||
      password === ""
    ) {
      throw Error("Empty Input Fields!");
    } else if (!/^[a-zA-Z ]*$/.test(firstName)) {
      throw Error("Invalid first name entered");
    } else if (!/^[a-zA-Z ]*$/.test(lastName)) {
      throw Error("Invalid last name entered");
    } else if (!/^[\w-\.+]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      throw Error("Invalid email entered");
    } else if (!/^[0-9]{11}$/.test(phoneNumber)) {
      throw Error("Invalid phone number entered (11 digits required)");
    } else if (!new Date(dateOfBirth).getTime()) {
      throw Error("Invalid date of birth entered");
    } else if (password.length < 8) {
      throw Error("Password is too short!");
    } else {
      // valid credentials
      const newUser = await createUser({
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        password,
      });

      const emailData = await sendVerificationEmail(newUser);
      res.json({
        status: "PENDING",
        message: "Verification email sent successfully",
        data: emailData,
      });
    }
  } catch (err) {
    res.json({
      status: "FAILED",
      message: err.message,
    });
  }
});

// sign in
router.post("/signin", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();

    if (email === "" || password === "") {
      throw Error("Empty Input Fields!");
    } else {
      //authenticate the user
      const authenticatedUser = await authenticateUser(email, password);
      if (authenticatedUser) {
        // password match
        res.json({
          status: "SUCCESS",
          message: "Sign in successful",
          data: authenticatedUser,
        });
      } else {
        res.json({
          status: "FAILED",
          message: "Invalid password entered",
        });
      }
    }
  } catch (err) {
    res.json({
      status: "FAILED",
      message: err.message,
    });
  }
});

// getAllUser
router.get("/getAllUsers", async (req, res) => {
  try {
    let { users, totalUsers } = await getAllUsers(req);
    return res.send({
      message: "Users fetched successfully",
      data: {
        users,
        count: totalUsers,
      },
    });
  } catch (err) {
    res.json({
      status: "FAILED",
      message: err.message,
    });
  }
});

module.exports = router;
