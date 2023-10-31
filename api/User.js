require("dotenv").config();

const express = require("express");
const router = express.Router();

//mongodb user model
const User = require("./../models/User");

//mongodb user verification model
const UserVerification = require("./../models/UserVerification");

//mongodb password reset model
const PasswordReset = require("./../models/PasswordReset");

//email unique string
const { v4: uuidv4 } = require("uuid");

// Password handler
const bcrypt = require("bcrypt");
//email handler

const nodemailer = require("nodemailer");

const clientUrl = process.env.CLIENT_URL;

//nodemailer transporter
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.PASSWORD,
  },
});

// test transporter
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for message");
    console.log(success);
  }
});

// sign up
router.post("/signup", (req, res) => {
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
    res.json({
      status: "FAILED",
      message: "Empty Input Fields!",
    });
  } else if (!/^[a-zA-Z ]*$/.test(firstName)) {
    res.json({
      status: "FAILED",
      message: "Invalid first name entered",
    });
  } else if (!/^[a-zA-Z ]*$/.test(lastName)) {
    res.json({
      status: "FAILED",
      message: "Invalid last name entered",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email entered",
    });
  } else if (!/^[0-9]{11}$/.test(phoneNumber)) {
    res.json({
      status: "FAILED",
      message: "Invalid phone number entered (11 digits required)",
    });
  } else if (!new Date(dateOfBirth).getTime()) {
    res.json({
      status: "FAILED",
      message: "Invalid date of birth entered",
    });
  } else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password is too short!",
    });
  } else {
    // checking if the user exist already
    User.find({ email })
      .then((result) => {
        if (result.length) {
          res.json({
            status: "FAILED",
            message: "User with the provided email already exists",
          });
        } else {
          // Try Create new user

          // password handling
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                firstName,
                lastName,
                email,
                dateOfBirth,
                phoneNumber,
                password: hashedPassword,
                isVerified: false,
              });

              newUser
                .save()
                .then((result) => {
                  // handle account verification
                  sendVerificationEmail(result, res);
                })
                .catch((err) => {
                  console.log(err);
                  res.json({
                    status: "FAILED",
                    message: "An error has occurred while saving user account",
                  });
                });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: "FAILED",
                message: "An error has occurred while hashing password!",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error has occurred while checking for existing user",
        });
      });
  }
});

// send verification
const sendVerificationEmail = ({ _id, email }, res) => {
  // url to be used in the email
  const currentUrl = process.env.BASE_URL || "http://localhost:5000/";

  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify your email",
    html: `<p>Verify your email address to complete the signup and login to your account</p><p>This link <b>expires in 6 hours</b>.<p>Press <a href=${
      currentUrl + "user/verify/" + _id + "/" + uniqueString
    } target="_blank"> to proceed</a></p></p>`,
  };

  //hash the unique string
  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      const newVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiredAt: Date.now() + 3600000,
      });

      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              res.json({
                status: "PENDING",
                message: "Verification email sent",
              });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: "FAILED",
                message: "Verification email failed",
              });
            });
        })
        .catch(() => {
          res.json({
            status: "FAILED",
            message: "Couldn't save verification email date",
          });
        });
    })
    .catch((err) => {
      res.json({
        status: "FAILED",
        message: "An error has occurred while hatching email data",
      });
    });
};

// verify email
router.get("/verify/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;

  UserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        const { expiredAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;

        if (expiredAt < Date.now()) {
          // record has expired so delete record
          UserVerification.deleteOne({ userId })
            .then((result) => {
              User.deleteOne({ _id: userId })
                .then(() => {
                  let message = "Link has expired, please sign up again.";
                  res.redirect(
                    `${clientUrl}auth/verified?error=true&message=${message}`
                  );
                })
                .catch(() => {
                  let message = "Clearing user with expired unique link failed";
                  res.redirect(
                    `${clientUrl}auth/verified?error=true&message=${message}`
                  );
                });
            })
            .catch(() => {
              let message =
                "An error has occurred while clearing for expired user verification record";
              res.redirect(
                `${clientUrl}auth/verified?error=true&message=${message}`
              );
            });
        } else {
          // valid record exist

          // first compare the hashed uniqueString

          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                User.updateOne({ _id: userId }, { isVerified: true })
                  .then(() => {
                    UserVerification.deleteOne({ userId })
                      .then(() => {
                        res.redirect(`${clientUrl}auth/verified/`);
                      })
                      .catch(() => {
                        let message =
                          "An error has occurred while finalizing successful verification";
                        res.redirect(
                          `${clientUrl}auth/verified?error=true&message=${message}`
                        );
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    let message =
                      "An error has occurred while updating user verification record";
                    res.redirect(
                      `${clientUrl}auth/verified?error=true&message=${message}`
                    );
                  });
              } else {
                // existing record, incorrect link
                let message =
                  "Invalid verification details passed, check your inbox";
                res.redirect(
                  `${clientUrl}auth/verified?error=true&message=${message}`
                );
              }
            })
            .catch(() => {
              let message =
                "An error has occurred while comparing unique strings";
              res.redirect(
                `${clientUrl}auth/verified?error=true&message=${message}`
              );
            });
        }
      } else {
        let message =
          "Account record doesn't exist or has been verified already";
        res.redirect(`${clientUrl}auth/verified?error=true&message=${message}`);
      }
    })
    .catch((err) => {
      console.log(err);
      let message =
        "An error has occurred while checking for existing user verification record";
      res.redirect(`${clientUrl}auth/verified?error=true&message=${message}`);
    });
});

// sign in
router.post("/signin", (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email === "" || password === "") {
    res.json({
      status: "FAILED",
      message: "Empty Input Fields!",
    });
  } else {
    User.find({ email })
      .then((data) => {
        if (data?.length) {
          // check if user is verified
          if (!data[0]?.isVerified) {
            res.json({
              status: "FAILED",
              message: "Email hasn't been verified yet, check you inbox",
            });
          } else {
            // user exist
            const hashedPassword = data[0].password;
            bcrypt
              .compare(password, hashedPassword)
              .then((result) => {
                if (result) {
                  // password match
                  res.json({
                    status: "SUCCESS",
                    message: "Sign in successful",
                    data: data,
                  });
                } else {
                  res.json({
                    status: "FAILED",
                    message: "Invalid password entered",
                  });
                }
              })

              .catch((err) => {
                res.json({
                  status: "FAILED",
                  message: "An error occurred while comparing passwords",
                });
              });
          }
        } else {
          res.json({
            status: "FAILED",
            message: "Invalid credentials entered",
          });
        }
      })
      .catch((err) => {
        res.json({
          status: "FAILED",
          message: "An error occurred while checking for existing user",
        });
      });
  }
});

// Password Reset
router.post("/requestPasswordReset", (req, res) => {
  const { email, redirectUrl } = req.body;

  // check if email exist
  User.findOne({ email })
    .then((data) => {
      console.log(data, "111");
      console.log(data.length, "222");
      console.log(data[0].length, "333");
      if (data.email) {
        // user exists

        // user has been verified
        if (!data[0].isVerified) {
          res.json({
            status: "FAILED",
            message: "Email hasn't been verified yet, check you inbox",
          });
        } else {
          // proceed with reset password
          sendResetEmail(data[0], redirectUrl, res);
        }
      } else {
        res.json({
          status: "FAILED",
          message: "No account with the supplied email exist",
        });
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.json({
        status: "FAILED",
        message: "An error has occurred while checking for existing user",
      });
    });
});

const sendResetEmail = ({ _id, email }, redirectUrl, res) => {
  const resetString = uuidv4 + _id;

  PasswordReset.deleteMany({ userId: _id })
    .then((result) => {
      // reset records deleted successfully

      // send the reset email
      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Password Reset",
        html: `<p>We heard you lost your password</p><p>Don't worry use this link to reset your password</p><p>This link <b>expires in 60 minutes</b>.<p>Press <a href=${
          redirectUrl + "/" + _id + "/" + resetString
        } target="_blank"> to proceed</a></p></p>`,
      };

      //hash the researchString

      const saltRounds = 10;
      bcrypt
        .hash(resetString, saltRounds)
        .then((hashedResetString) => {
          const newPasswordReset = new PasswordReset.create({
            userId: _id,
            resetString: hashedResetString,
            createdAt: Date.now(),
            expiredAt: Date.now() + 3600000,
          });

          newPasswordReset
            .save()
            .then(() => {
              transporter
                .sendMail(mailOptions)
                .then(() => {
                  res.json({
                    status: "PENDING",
                    message: "Password reset email sent",
                  });
                })
                .catch((error) => {
                  console.log(error.message);
                  res.json({
                    status: "FAILED",
                    message:
                      "An error has occurred while sending password reset email",
                  });
                });
            })
            .catch((error) => {
              console.log(error.message);
              res.json({
                status: "FAILED",
                message:
                  "An error has occurred while saving password reset record",
              });
            });
        })
        .catch((error) => {
          console.log(error.message);

          res.json({
            status: "FAILED",
            message: "An error has occurred while hashing password",
          });
        });
    })
    .catch((err) => {
      console.log(err.message);
      res.json({
        status: "FAILED",
        message:
          "An error has occurred while clearing for expired password reset record",
      });
    });
};

module.exports = router;
