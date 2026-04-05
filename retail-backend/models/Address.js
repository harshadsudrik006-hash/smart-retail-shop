const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({

  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  address:String,
  lat:Number,
  lng:Number,

  flat:String,
  building:String,
  floor:String,
  landmark:String,
  type:String,

  isDefault:{
    type:Boolean,
    default:false
  }

},{timestamps:true});

module.exports = mongoose.model("Address", addressSchema);