const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

// ✅ IMPORT ALL FUNCTIONS (IMPORTANT)
const { createPayment, getKey, createQR } = require("../controllers/paymentController");

// ==========================
// 🟢 CREATE ORDER
// ==========================
router.post("/create", authMiddleware, createPayment);

// ==========================
// 🟢 GET KEY
// ==========================
router.get("/key", getKey);

// ==========================
// 🟢 RAZORPAY QR
// ==========================
router.post("/qr", authMiddleware, createQR);

module.exports = router;