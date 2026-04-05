const express = require("express");
const router = express.Router();

const {
  updateStock,
  getStock
} = require("../controllers/inventoryController");

router.post("/update", updateStock);
router.get("/", getStock);

module.exports = router;