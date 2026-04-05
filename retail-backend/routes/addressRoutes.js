const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress
} = require("../controllers/addressController");

router.post("/", authMiddleware, addAddress);
router.get("/", authMiddleware, getMyAddresses);
router.put("/:id", authMiddleware, updateAddress);
router.delete("/:id", authMiddleware, deleteAddress);

module.exports = router;