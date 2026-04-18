const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  sendOrderOTP,
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
  getDeliveryBoys,
  assignDeliveryBoy,
  getMyDeliveryOrders,
  sendDeliveryOTP,
  verifyDeliveryOTP,
  repeatOrder,
  cancelOrder,
  downloadInvoice,
  adminCancelOrder,
  updateDeliveryLocation,
updatePaymentStatus
} = require("../controllers/orderController");

// =======================
// ORDER FLOW
// =======================

// Order OTP
router.post("/send-otp", authMiddleware, sendOrderOTP);
router.post("/place", authMiddleware, placeOrder);

// My Orders
router.get("/my-orders", authMiddleware, getOrders);

// All Orders
router.get("/", authMiddleware, getOrders);

// Repeat + Cancel
router.post("/repeat/:id", authMiddleware, repeatOrder);
router.put("/cancel/:id", authMiddleware, cancelOrder);
router.put(
  "/admin-cancel/:id",
  authMiddleware,
  roleMiddleware("admin","manager"),
  adminCancelOrder
);

// =======================
// DELIVERY SYSTEM (⚠️ पहले रखना जरूरी)
// =======================

// ✅ DELIVERY BOYS (IMPORTANT - BEFORE /:id)
router.get("/delivery-boys", authMiddleware, getDeliveryBoys);
router.put("/payment/:id", authMiddleware, updatePaymentStatus);

// Assign Delivery
router.put(
  "/assign/:id",
  authMiddleware,
  roleMiddleware("admin","manager"),
  assignDeliveryBoy
);

// Delivery Orders
router.get("/my-delivery-orders", authMiddleware, getMyDeliveryOrders);

// =======================
// TRACKING
// =======================

router.get("/track/:id", authMiddleware, trackOrder);

// =======================
// STATUS UPDATE
// =======================

router.put("/:id/status", authMiddleware, updateOrderStatus);

// =======================
// SINGLE ORDER (⚠️ LAST में)
// =======================

router.get("/:id", authMiddleware, getOrderById);

// =======================
// DELIVERY OTP
// =======================

router.post("/delivery-otp/:id", authMiddleware, sendDeliveryOTP);
router.post("/verify-delivery/:id", authMiddleware, verifyDeliveryOTP);

//delivery boy location
router.put("/location/:id", authMiddleware, updateDeliveryLocation);


router.get("/invoice/:id", authMiddleware, downloadInvoice);
module.exports = router;