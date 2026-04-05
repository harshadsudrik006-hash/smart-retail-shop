const Razorpay = require("razorpay");
const { createPaymentOrder } = require("../services/paymentService");

// 🔥 RAZORPAY INSTANCE
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

// ==========================
// 🟢 CREATE ORDER (RAZORPAY POPUP)
// ==========================
exports.createPayment = async (req, res) => {
  try {

    const { amount } = req.body;

    const order = await createPaymentOrder(amount);

    res.json({
      success: true,
      order
    });

  } catch (error) {

    console.log("PAYMENT ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
};

// ==========================
// 🟢 SEND KEY
// ==========================
exports.getKey = (req, res) => {
  res.json({
    key: process.env.RAZORPAY_KEY
  });
};

// ==========================
// 🟢 CREATE QR CODE (🔥 MAIN)
// ==========================
exports.createQR = async (req, res) => {
  try {

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const qr = await instance.qrCode.create({
      type: "upi_qr",
      name: "Smart Retail Shop",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amount * 100, // 🔥 paise
      description: "Order Payment"
    });

    res.json({
      success: true,
      qrCode: qr.image_url
    });

  } catch (error) {

    console.log("QR ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
};