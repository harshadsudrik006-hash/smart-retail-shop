const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  avatar: String,
  loginType: String,
  role: {
    type: String,
    default: "user"
  },
  points: {
    type: Number,
    default: 0
  }
},{timestamps:true});

module.exports = mongoose.model("User", userSchema);