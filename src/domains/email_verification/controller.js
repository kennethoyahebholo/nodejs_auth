const { v4: uuidv4 } = require("uuid");
const hashedData = require("../../utils/hashData");
const sendEmail = require("../../utils/sendEmail");
const UserVerification = require("./model")

const sendVerificationEmail = async ({ _id, email }) => {
  try {
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
    const hashedUniqueString = await hashedData(uniqueString, saltRounds);
    const newVerification = new UserVerification({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expiredAt: Date.now() + 3600000,
    });

    await newVerification.save();
    await sendEmail(mailOptions);

    return {
      userId: _id,
      email,
    };
  } catch (err) {
    throw error;
  }
};

module.exports = { sendVerificationEmail };
