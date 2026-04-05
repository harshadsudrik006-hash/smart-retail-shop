const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

exports.createPaymentOrder = async (amount) => {

  const options = {
    amount: amount * 100, // paisa → rupees * 100
    currency: "INR",
    receipt: "receipt_" + Date.now()
  };

  const order = await razorpay.orders.create(options);

  return order;
};