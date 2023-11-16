const User = require("./model");
const verifyHashedData = require("../../utils/verifyHashedData");

const UserVerification = require("./model");

const handleUserVerification = async ({ userId, uniqueString, clientUrl }) => {
  try {
    const result = UserVerification.find({ userId });
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
    throw err;
  }
};

module.exports = { handleUserVerification };
