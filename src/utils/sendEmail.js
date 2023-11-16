const nodemailer = require("nodemailer");

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

const sendEmail = async (mailOptions) => {
  try {
    const emailSent = await transporter.sendMail(mailOptions);
    return emailSent;
  } catch (e) {
    throw e;
  }
};

module.exports = sendEmail;
