const User = require("./model");
const hashedData = require("../../utils/hashData");
const verifyHashedData = require("../../utils/verifyHashedData");

const createUser = async (data) => {
  const { firstName, lastName, email, phoneNumber, dateOfBirth, password } =
    data;
  try {
    const existingUser = await User.find({ email });
    if (existingUser.length) {
      throw Error("User with the provided email already exists");
    } else {
      // password handling
      const hashedPassword = await hashedData(password);
      const newUser = new User({
        firstName,
        lastName,
        email,
        dateOfBirth,
        phoneNumber,
        password: hashedPassword,
        isVerified: false,
      });

      const createdUser = await newUser.save();
      return createdUser;
    }
  } catch (err) {
    throw err;
  }
};

const authenticateUser = async (email, password) => {
  try {
    const fetchedUser = await User.find({ email });
    if (!fetchedUser?.length) {
      throw Error("Invalid credentials entered");
    } else {
      if (!fetchedUser[0]?.isVerified) {
        throw Error("Email hasn't been verified yet, check your inbox");
      } else {
        const hashedPassword = fetchedUser[0].password;
        const passwordMatch = await verifyHashedData(password, hashedPassword);

        if (!passwordMatch) {
          throw Error("Invalid password entered");
        } else {
          return fetchedUser;
        }
      }
    }
  } catch (err) {
    throw err;
  }
};

module.exports = { createUser, authenticateUser };
