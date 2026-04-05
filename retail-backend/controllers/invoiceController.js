const Invoice = require("../models/Invoice");
const Order = require("../models/Order");

/* CREATE INVOICE */
exports.createInvoice = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    const invoice = await Invoice.create({
      order: order._id,
      user: order.user,
      amount: order.totalAmount
    });

    res.json({ message: "Invoice created ✅", invoice });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET ALL INVOICES */
exports.getInvoices = async (req, res) => {
  try {

    const invoices = await Invoice.find()
      .populate("order")
      .populate("user");

    res.json(invoices);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};