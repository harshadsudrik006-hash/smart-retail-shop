const Order = require("../models/Order");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const ORDER_STATUS = require("../constants/orderStatus");
const Invoice = require("../models/Invoice");
const generateInvoice = require("../utils/generateInvoice");
const mongoose = require("mongoose"); // ✅ ADD THIS

// OTP Stores
let orderOTPStore = {};
let deliveryOTPStore = {};


/* ===========================
   SEND ORDER OTP (FIXED)
=========================== */
exports.sendOrderOTP = async (req, res) => {
  try {

    const phone = req.user.phone || "7048707335";

    const otp = Math.floor(100000 + Math.random() * 900000);

    orderOTPStore[req.user.id] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    console.log("👤 USER:", req.user);
    console.log("📞 PHONE:", phone);
    console.log("🔐 OTP:", otp);

    // 🔥 SMS TRY (FAIL HO TO BHI CONTINUE)
    try {
      await sendSMS(phone, `OTP: ${otp}`);
    } catch (err) {
      console.log("⚠️ SMS failed but OTP still valid");
    }

    // 🔥 RESPONSE (TESTING MODE)
    res.json({
      message: "OTP sent ✅",
      otp   // 🔥 remove later in production
    });

  } catch (error) {

    console.log("❌ OTP SEND ERROR:", error);

    res.status(500).json({
      message: "OTP failed",
      error: error.message
    });
  }
};


/* ===========================
   PLACE ORDER
=========================== */
const Inventory = require("../models/Inventory"); // ✅ ADD THIS TOP

exports.placeOrder = async (req, res) => {
  try {

    const { otp, addressId, paymentMethod, paymentId, usePoints, discount = 0 } = req.body;
    const userId = req.user.id;

    const storedOTP = orderOTPStore[userId];

    if (!storedOTP || storedOTP.otp !== Number(otp)) {
      return res.status(400).json({ message: "Invalid OTP ❌" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart empty ❌" });
    }

    let total = 0;
    const products = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      total += product.price * item.quantity;

      products.push({
        product: product._id,
        quantity: item.quantity
      });
    }

    // 🔥 APPLY COUPON DISCOUNT
    total -= discount;
    if (total < 0) total = 0;

    const user = await User.findById(userId);

    // 🟢 POINT REDEEM (ONLY COD)
    let pointsUsed = 0;

    if (
      usePoints &&
      paymentMethod === "cod" &&
      user.points >= 100 &&
      total >= 100
    ) {
      pointsUsed = Math.min(user.points, total);
      total -= pointsUsed;

      user.points -= pointsUsed;
    }

    // 🧾 CREATE ORDER
    const order = await Order.create({
      user: userId,
      address: addressId,
      products,
      totalAmount: total,
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "paid" : "pending",
      paymentId,
      pointsUsed,
      discount, // 🔥 SAVE DISCOUNT
      status: "Pending",
      timeline: [{ status: "Pending" }]
    });

    await Cart.deleteOne({ user: userId });

    // 🟢 POINT EARNING
    const earnedPoints = Math.floor(total / 100);

    user.points += earnedPoints;
    await user.save();

    res.json({
      message: "Order placed successfully ✅",
      order,
      earnedPoints
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   GET USER ORDERS
=========================== */
exports.getOrders = async (req, res) => {
  try {

    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    const finalOrders = [];

    for (const order of orders) {

      const products = [];

      for (const item of order.products) {

        const product = await Product.findById(item.product);

        if (product) {
          products.push({
            product,
            quantity: item.quantity
          });
        }
      }

      finalOrders.push({
        ...order._doc,
        products
      });
    }

    res.json(finalOrders);

  } catch (error) {
    console.log("❌ GET ORDER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


/* ===========================
   GET SINGLE ORDER
=========================== */
exports.getOrderById = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Not found" });

    const products = [];

    for (const item of order.products) {

      const product = await Product.findById(item.product);

      if (product) {
        products.push({
          product,
          quantity: item.quantity
        });
      }
    }

    res.json({
      ...order._doc,
      products
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ===========================
   UPDATE STATUS
=========================== */
exports.updateOrderStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Not found" });
    }

    // 🔥 LOCK CONDITION
    if (order.status === "Delivered" || order.status === "Cancelled") {
      return res.status(400).json({
        message: "Order cannot be modified ❌"
      });
    }

    order.status = status;

    order.timeline.push({
      status,
      date: new Date()
    });

    await order.save();

    // 🔥 REALTIME UPDATE
    if (global.io) {
      global.io.emit("orderUpdated", {
        orderId: order._id,
        status
      });
    }

    res.json({ message: "Updated ✅", order });

  } catch (error) {
    console.log("❌ STATUS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
/* ===========================
   TRACK ORDER
=========================== */
exports.trackOrder = async (req, res) => {
  try {

    const userId = req.user.id;

    const order = await Order.findOne({
      _id: req.params.id,
      user: userId
    });

    // ✅ FIXED ERROR RESPONSE
    if (!order) {
      return res.status(404).json({
        message: "Order not found ❌"
      });
    }

    // =========================
    // ✅ TIMELINE (REAL + FALLBACK)
    // =========================

    let timeline = [];

    if (order.timeline && order.timeline.length > 0) {
      // ✅ USE REAL DATABASE TIMELINE
      timeline = order.timeline.map((t, index) => ({
        status: t.status,
        completed: true,
        current: index === order.timeline.length - 1,
        date: t.date
      }));
    } else {
      // ✅ FALLBACK (STATIC)
      const steps = [
        "Order Placed",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered"
      ];

      const currentIndex = steps.indexOf(order.status);

      timeline = steps.map((step, index) => ({
        status: step,
        completed: index <= currentIndex,
        current: index === currentIndex
      }));
    }

    // =========================
    // ✅ SAFE LOCATION (VAPI DEFAULT)
    // =========================

    let deliveryLocation = {
      lat: 20.3893,   // Vapi
      lng: 72.9106
    };

    if (
      order.deliveryLocation &&
      order.deliveryLocation.lat != null &&
      order.deliveryLocation.lng != null
    ) {
      deliveryLocation = {
        lat: Number(order.deliveryLocation.lat),
        lng: Number(order.deliveryLocation.lng)
      };
    }

    // =========================
    // ✅ FINAL RESPONSE
    // =========================

    res.json({
      orderId: order._id,
      status: order.status,
      timeline,
      deliveryLocation
    });

  } catch (error) {
    console.log("❌ TRACK ORDER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


/* ===========================
   DELIVERY BOYS (FIXED)
=========================== */
exports.getDeliveryBoys = async (req, res) => {
  try {

    console.log("🔍 Fetching delivery boys...");

    const users = await User.find({
      role: { $regex: /^delivery$/i }
    }).lean();

    console.log("🚚 DELIVERY USERS:", users);

    if (!users || users.length === 0) {
      return res.json([]);
    }

    const formatted = users.map(u => ({
      _id: u._id,
      name: u.name || "No Name",
      email: u.email || ""
    }));

    res.json(formatted);

  } catch (error) {

    console.log("❌ DELIVERY ERROR:", error);

    res.status(500).json({
      message: "Delivery fetch failed",
      error: error.message
    });

  }
};

exports.updateDeliveryLocation = async (req, res) => {
  try {

    let { lat, lng } = req.body;

    // ✅ CONVERT TO NUMBER
    lat = Number(lat);
    lng = Number(lng);

    // ✅ VALIDATION (VERY IMPORTANT)
    if (
      lat == null ||
      lng == null ||
      isNaN(lat) ||
      isNaN(lng)
    ) {
      return res.status(400).json({
        message: "Invalid latitude/longitude ❌"
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    // ✅ SAFE CHECK (avoid crash if null)
    if (!order.deliveryBoy || order.deliveryBoy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed ❌" });
    }

    // ✅ SAVE CLEAN DATA
    order.deliveryLocation = {
      lat: lat,
      lng: lng
    };

    await order.save();

    res.json({
      message: "Location updated ✅",
      deliveryLocation: order.deliveryLocation
    });

  } catch (error) {
    console.log("❌ LOCATION UPDATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   ASSIGN DELIVERY
=========================== */
exports.assignDeliveryBoy = async (req, res) => {
  try {

    const { deliveryBoyId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    // 🔥 FINAL LOCK
    if (order.status === "Delivered" || order.status === "Cancelled") {
      return res.status(400).json({
        message: "Cannot assign delivery ❌"
      });
    }

    order.deliveryBoy = deliveryBoyId;
    order.status = "Out for Delivery";

    order.timeline.push({
      status: "Out for Delivery",
      date: new Date()
    });

    await order.save();

    res.json({ message: "Assigned successfully ✅", order });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyDeliveryOrders = async (req, res) => {
  try {

    console.log("👤 DELIVERY USER ID:", req.user.id);

    const orders = await Order.find({
     deliveryBoy: new mongoose.Types.ObjectId(req.user.id)
    }).populate("user");

    console.log("📦 FOUND DELIVERY ORDERS:", orders);

    if (!orders || orders.length === 0) {
      return res.json([]);
    }

    const finalOrders = [];

    for (const order of orders) {

      const products = [];

      for (const item of order.products) {

        const product = await Product.findById(item.product);

        if (product) {
          products.push({
            product,
            quantity: item.quantity
          });
        }
      }

      finalOrders.push({
        ...order._doc,
        products
      });
    }

    res.json(finalOrders);

  } catch (error) {
    console.log("❌ DELIVERY ORDER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   DELIVERY OTP
=========================== */
exports.sendDeliveryOTP = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id).populate("user");

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    if (!order.user || !order.user.phone) {
      return res.status(400).json({ message: "User phone not found ❌" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    deliveryOTPStore[order._id] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    console.log("📦 ORDER:", order._id);
    console.log("📞 PHONE:", order.user.phone);
    console.log("🔐 DELIVERY OTP:", otp);

    // 🔥 SAFE SMS (FAIL HO TO BHI CONTINUE)
    try {
      await sendSMS(order.user.phone, `OTP: ${otp}`);
    } catch (err) {
      console.log("⚠️ Delivery SMS failed but OTP still valid");
    }

    res.json({
      message: "Delivery OTP sent ✅",
      otp // 🔥 testing ke liye (production me remove)
    });

  } catch (error) {

    console.log("❌ DELIVERY OTP ERROR:", error);

    res.status(500).json({
      message: "Delivery OTP failed",
      error: error.message
    });
  }
};


exports.verifyDeliveryOTP = async (req, res) => {
  try {

    const { otp } = req.body;
    const stored = deliveryOTPStore[req.params.id];

    if (!stored || stored.otp != otp || stored.expires < Date.now()) {
      return res.status(400).json({ message: "Invalid OTP ❌" });
    }

    delete deliveryOTPStore[req.params.id];

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Already Delivered ⚠️" });
    }

    // ✅ UPDATE STATUS
    order.status = "Delivered";

    order.timeline.push({
      status: "Delivered",
      date: new Date()
    });

    await order.save();

    // 📦 ✅ STOCK DECREASE HERE (FINAL PLACE)
    for (const item of order.products) {

      const stockItem = await Inventory.findOne({
        product: item.product
      });

      if (stockItem) {
        stockItem.stock -= item.quantity;

        if (stockItem.stock < 0) {
          stockItem.stock = 0;
        }

        await stockItem.save();
      }
    }

    console.log("📦 STOCK UPDATED AFTER DELIVERY");

    // 🧾 INVOICE
  // 🧾 SAFE INVOICE CREATE
const existingInvoice = await Invoice.findOne({ order: order._id });

if (!existingInvoice) {
  await Invoice.create({
    order: order._id,
    user: order.user,
    amount: order.totalAmount
  });
}

    // 🎁 POINTS
    const user = await User.findById(order.user);
    if (user) {
      user.points = (user.points || 0) + Math.floor(order.totalAmount / 100);
      await user.save();
    }

    // 🔥 REALTIME EMIT (IMPORTANT)
    if (global.io) {
      global.io.emit("orderUpdated", {
        orderId: order._id,
        status: "Delivered"
      });
    }

    res.json({
      message: "Delivered + Stock Updated + Invoice Created ✅",
      order
    });

  } catch (error) {
    console.log("❌ VERIFY OTP ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.getAllOrders = async (req, res) => {
  try {

    const orders = await Order.find().populate("user");

    const finalOrders = [];

    for (const order of orders) {

      const products = [];

      for (const item of order.products) {

        const product = await require("../models/Product")
          .findById(item.product);

        if (product) {
          products.push({
            product,
            quantity: item.quantity
          });
        }
      }

      finalOrders.push({
        ...order._doc,
        products
      });
    }

    res.json(finalOrders);

  } catch (error) {
    console.log("❌ ADMIN ORDER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// Report 
exports.repeatOrder = async (req, res) => {
  try {

    const oldOrder = await Order.findById(req.params.id);

    if (!oldOrder) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    const newOrder = await Order.create({
      user: oldOrder.user,
      address: oldOrder.address,
      products: oldOrder.products,
      totalAmount: oldOrder.totalAmount,
      status: "Pending",
      timeline: [{ status: "Pending" }]
    });

    res.json({
      message: "Order repeated successfully ✅",
      order: newOrder
    });

  } catch (error) {
    console.log("❌ REPEAT ORDER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// Cancel Order
exports.cancelOrder = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Cannot cancel delivered order ❌" });
    }

    // ✅ USER CANCEL
    order.status = "Cancelled";
    order.cancelledBy = "User";

    order.timeline.push({
      status: "Cancelled",
      date: new Date()
    });

    await order.save();

    res.json({
      message: "Order cancelled by user ✅",
      order
    });

  } catch (error) {
    console.log("❌ CANCEL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.adminCancelOrder = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Cannot cancel delivered order ❌" });
    }

    // ✅ ADMIN CANCEL
    order.status = "Cancelled";
    order.cancelledBy = "Admin";

    order.timeline.push({
      status: "Cancelled",
      date: new Date()
    });

    await order.save();

    res.json({
      message: "Order cancelled by admin ✅",
      order
    });

  } catch (error) {
    console.log("❌ ADMIN CANCEL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    generateInvoice(res, order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};