const { v4: uuidv4 } = require("uuid");
const hashedData = require("../../utils/hashData");
const sendEmail = require("../../utils/sendEmail");
const User = require("../user/model");
const UserVerification = require("./model");
const verifyHashedData = require("../../utils/verifyHashedData");

const sendVerificationEmail = async ({ _id, email }) => {
  try {
    const currentUrl = process.env.BASE_URL || "http://localhost:5000/";

    const uniqueString = uuidv4() + _id;

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify your email",
      html: `<p>Verify your email address to complete the signup and login to your account</p><p>This link <b>expires in 6 hours</b>.<p>Press <a href=${
        currentUrl + "email_verification/verify/" + _id + "/" + uniqueString
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

const handleUserVerification = async (userId, uniqueString, clientUrl, res) => {
  try {
    const result = await UserVerification.find({ userId });
    if (result.length > 0) {
      const { expiredAt } = result[0];
      const hashedUniqueString = result[0].uniqueString;

      if (expiredAt < Date.now()) {
        // record has expired so delete record
        await UserVerification.deleteOne({ userId });
        await User.deleteOne({ _id: userId });
        let message = "Link has expired, please sign up again.";
        res.redirect(`${clientUrl}auth/verified?error=true&message=${message}`);
      } else {
        // valid record exist
        // first compare the hashed uniqueString
        const hashedString = await verifyHashedData(
          uniqueString,
          hashedUniqueString
        );
        if (hashedString) {
          await User.updateOne({ _id: userId }, { isVerified: true });
          await UserVerification.deleteOne({ userId });
          res.redirect(`${clientUrl}auth/verified/`);
        } else {
          // existing record, incorrect link
          let message = "Invalid verification details passed, check your inbox";
          res.redirect(
            `${clientUrl}auth/verified?error=true&message=${message}`
          );
        }
      }
    } else {
      let message = "Account record doesn't exist or has been verified already";
      res.redirect(`${clientUrl}auth/verified?error=true&message=${message}`);
    }
  } catch (err) {
    let message = "An error occurred while verifying the account";
    res.redirect(`${clientUrl}auth/verified?error=true&message=${message}`);
  }
};

module.exports = { sendVerificationEmail, handleUserVerification };
