const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  dashboardStats,
  getAllUsers,
  getAllOrders,
  updateUserRole,
  deleteUser
} = require("../controllers/adminController");

/* ================================
   ADMIN DASHBOARD
================================ */
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin","manager"), // ✅ FIXED
  dashboardStats
);

/* ================================
   GET ALL USERS
================================ */
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin","manager"), // ✅ FIXED
  getAllUsers
);

/* ================================
   UPDATE USER ROLE
================================ */
router.put(
  "/user-role",
  authMiddleware,
  roleMiddleware("admin"), // keep strict
  updateUserRole
);

/* ================================
   DELETE USER
================================ */
router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"), // only admin can delete
  deleteUser
);

/* ================================
   GET ALL ORDERS
================================ */
router.get(
  "/orders",
  authMiddleware,
  roleMiddleware("admin","manager"), // ✅ FIXED
  getAllOrders
);

module.exports = router;