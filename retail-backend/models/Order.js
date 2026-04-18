const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true
  },
  
  deliveryBoy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},
cancelledBy: {
  type: String,
  enum: ["user", "admin"],
  default: null
},

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],

  totalAmount: Number,

  status: {
    type: String,
    default: "Pending"
  },

  // 🔥 NEW PAYMENT FIELDS
  paymentMethod: {
    type: String,
    enum: ["online", "cod"],
    default: "cod"
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },

  paymentId: String,

  timeline: [
    {
      status: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],

  deliveredAt: {
  type: Date
},

  deliveryLocation: {
  lat: Number,
  lng: Number
}

},{timestamps:true});

module.exports = mongoose.model("Order", orderSchema);