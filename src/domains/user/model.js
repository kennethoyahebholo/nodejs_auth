const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  dateOfBirth: Date,
  password: String,
  isVerified: Boolean,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
