const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");


// 🟢 ADD TO CART
exports.addToCart = async (req, res) => {
  try {

    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // 🔥 1. VALIDATE INPUT
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid data ❌"
      });
    }

    // 🔥 2. GET PRODUCT + STOCK CHECK
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found ❌"
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        message: "Product out of stock ❌"
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {

      // 🔥 LIMIT QUANTITY
      if (quantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} items available ❌`
        });
      }

      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity }]
      });

    } else {

      const index = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (index > -1) {

        const newQty = cart.items[index].quantity + quantity;

        // 🔥 STOCK LIMIT CHECK
        if (newQty > product.stock) {
          return res.status(400).json({
            message: `Only ${product.stock} items available ❌`
          });
        }

        cart.items[index].quantity = newQty;

        // 🔥 REMOVE IF 0
        if (cart.items[index].quantity <= 0) {
          cart.items.splice(index, 1);
        }

      } else {

        // 🔥 NEW ITEM STOCK CHECK
        if (quantity > product.stock) {
          return res.status(400).json({
            message: `Only ${product.stock} items available ❌`
          });
        }

        cart.items.push({ product: productId, quantity });

      }

      await cart.save();
    }

    res.json({
      message: "Added to cart ✅",
      cart
    });

  } catch (error) {

    console.log("❌ ADD CART ERROR:", error);

    res.status(500).json({ error: error.message });

  }
};


// 🟢 GET CART (🔥 FINAL FIXED)
exports.getCart = async (req, res) => {

  try {

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.json({ items: [] });
    }

    const items = [];

    for (const item of cart.items) {

      try {

        // 🔥 VERY IMPORTANT FIX
        if (!mongoose.Types.ObjectId.isValid(item.product)) {
          console.log("❌ INVALID PRODUCT ID:", item.product);
          continue;
        }

        const productId = new mongoose.Types.ObjectId(item.product);

        const product = await Product.findById(productId);

        if (product) {

          items.push({
            product,
            quantity: item.quantity
          });

        } else {

          console.log("❌ PRODUCT NOT FOUND:", item.product);

        }

      } catch (err) {

        console.log("❌ PRODUCT FETCH ERROR:", err.message);

      }

    }

    res.json({ items });

  } catch (error) {

    console.log("❌ CART ERROR FULL:", error);

    res.status(500).json({
      message: "Cart fetch failed",
      error: error.message
    });

  }

};


// 🟢 REMOVE ITEM
exports.removeFromCart = async (req, res) => {

  try {

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.json({ items: [] });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await cart.save();

    res.json(cart);

  } catch (error) {

    console.log("❌ REMOVE ERROR:", error);

    res.status(500).json({ error: error.message });

  }

};