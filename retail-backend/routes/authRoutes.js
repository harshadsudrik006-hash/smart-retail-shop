const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRegister } = require("../validators/authValidator");

// Register
router.post("/register", validateRegister, authController.register);

// Normal Login
router.post("/login", authController.login);

// Google Login
router.post("/google-login", authController.googleLogin);

// Email Magic Login
router.post("/email-login", authController.emailLogin);

router.post("/email-login-verify", authController.verifyEmailLogin);



// 🔥 ADD THIS
router.put("/update-profile", authMiddleware, authController.updateProfile);

module.exports = router;