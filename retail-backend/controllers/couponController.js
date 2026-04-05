const Coupon = require("../models/Coupon");

// ================= APPLY COUPON =================
exports.applyCoupon = async (req, res) => {
  try {

    let { code, cartTotal } = req.body;

    code = code.toUpperCase();

    const coupon = await Coupon.findOne({ code, active: true });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon ❌" });
    }

    // 🔥 Expiry check
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: "Coupon expired ❌" });
    }

    // 🔥 Minimum amount check
    if (cartTotal < coupon.minAmount) {
      return res.status(400).json({
        message: `Minimum order ₹${coupon.minAmount}`
      });
    }

    const discount = (cartTotal * coupon.discount) / 100;

    res.json({
      coupon,
      discount,
      finalAmount: cartTotal - discount
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= BEST COUPON AUTO =================
exports.getBestCoupon = async (req, res) => {
  try {

    const { cartTotal } = req.body;

    const coupons = await Coupon.find({ active: true });

    // 🔥 DEBUG (TERMINAL ME DIKHEGA)
    console.log("🔥 ALL COUPONS FROM DB:", coupons);

    let bestDiscount = 0;
    let bestCoupon = null;

    for (let c of coupons) {

      // 🔥 Expiry check
      if (c.expiryDate && c.expiryDate < new Date()) continue;

      // 🔥 Minimum amount check
      if (cartTotal >= c.minAmount) {

        const discount = (cartTotal * c.discount) / 100;

        if (discount > bestDiscount) {
          bestDiscount = discount;
          bestCoupon = c;
        }
      }
    }

    res.json({
      coupon: bestCoupon,
      discount: bestDiscount,
      finalAmount: cartTotal - bestDiscount
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= ADMIN =================
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json({ message: "Coupon created ✅", coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};