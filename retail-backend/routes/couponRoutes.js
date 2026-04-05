const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  applyCoupon,
  createCoupon,
  getCoupons,
  deleteCoupon,
  getBestCoupon
} = require("../controllers/couponController");

// USER
router.post("/apply", authMiddleware, applyCoupon);
router.post("/best", authMiddleware, getBestCoupon);

// ADMIN
router.post("/", authMiddleware, createCoupon);
router.get("/", authMiddleware, getCoupons);
router.delete("/:id", authMiddleware, deleteCoupon);

module.exports = router;