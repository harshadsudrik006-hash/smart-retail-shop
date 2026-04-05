const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const productSchema = new mongoose.Schema({
  name: String,

  price: Number,              // selling price
  originalPrice: Number,     // 🔥 ADD THIS
  weight: String,            // 🔥 ADD THIS

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory"
  },

  stockHistory: [
  {
    oldStock: Number,
    newStock: Number,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }
],

  stock: Number,
  lowStockAlert: Number,


  description: String,
  image: String

},{ timestamps: true });

module.exports = mongoose.model("Product", productSchema);