const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: String,
  discount: Number,
  minAmount: Number,
  expiryDate: Date,
  active: Boolean
},{timestamps:true});

module.exports = mongoose.model("Coupon", couponSchema);