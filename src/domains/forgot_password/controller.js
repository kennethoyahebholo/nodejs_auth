const User = require("../user/model");
const PasswordReset = require("./model");
const hashedData = require("../../utils/hashData");
const verifyHashedData = require("../../utils/verifyHashedData");

const checkForExistingUser = async ({ email, redirectUrl }) => {
  try {
    const isUserExisting = await User.find({ email });
    if (!isUserExisting.length) {
      throw Error("No account with the supplied email exist");
    } else {
      return isUserExisting;
    }
  } catch (err) {
    throw err;
  }
};

const sendResetEmail = async ({ _id, email }, redirectUrl, resetString) => {
  try {
    await PasswordReset.deleteMany({ userId: _id });
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Password Reset",
      html: `<p>We heard you lost your password</p><p>Don't worry use this link to reset your password</p><p>This link <b>expires in 60 minutes</b>.<p>Press <a href=${
        redirectUrl + "/" + _id + "/" + resetString
      } target="_blank"> to proceed</a></p></p>`,
    };

    const hashedResetString = await hashedData(resetString);
    const newPasswordReset = new PasswordReset({
      userId: _id,
      resetString: hashedResetString,
      createdAt: Date.now(),
      expiredAt: Date.now() + 3600000,
    });

    await newPasswordReset.save();
    await sendEmail(mailOptions);
  } catch (err) {
    throw err;
  }
};

const handlePasswordReset = async ({ userId, resetString, newPassword }) => {
  try {
    const passwordReset = await PasswordReset.find({ userId });
    if (passwordReset?.length > 0) {
      const { expiredAt } = passwordReset[0];
      const hashedResetString = passwordReset[0].resetString;
      if (expiredAt < Date.now()) {
        await PasswordReset.deleteOne({ userId });
        res.json({
          status: "FAILED",
          message: "Password reset link has expired",
        });
      } else {
        const resetStringMatch = await verifyHashedData(
          resetString,
          hashedResetString
        );
        if (!resetStringMatch) {
          throw Error("Invalid password reset details provided");
        } else {
          const hashedNewPassword = await hashedData(newPassword);
          await User.updateOne(
            { _id: userId },
            { password: hashedNewPassword }
          );
          await PasswordReset.deleteOne({ userId });
        }
      }
    } else {
      throw Error("Password reset request not found");
    }
  } catch (err) {
    throw err;
  }
};

module.exports = { checkForExistingUser, sendResetEmail, handlePasswordReset };
