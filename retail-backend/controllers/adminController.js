const User = require("../models/User");
const Order = require("../models/Order");

/* ================================
   DASHBOARD STATS
================================ */
exports.dashboardStats = async (req, res) => {

  try {

    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    res.json({
      users: totalUsers,
      orders: totalOrders,
      revenue: revenue[0]?.total || 0
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


/* ================================
   GET ALL USERS
================================ */
exports.getAllUsers = async (req, res) => {

  try {

    const users = await User.find().sort({ createdAt: -1 });

    res.json(users);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


/* ================================
   GET ALL ORDERS
================================ */
exports.getAllOrders = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("user");

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

/* ================================
   UPDATE USER ROLE
================================ */
exports.updateUserRole = async (req, res) => {

  try {

    const { userId, role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    res.json({
      message: "User role updated successfully",
      user
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


/* ================================
   DELETE USER
================================ */
exports.deleteUser = async (req, res) => {
  try {

    const { id } = req.params;

    // ❌ prevent self delete (optional but recommended)
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};