const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductsBySubCategory,
  getProductsByCategory,   // ✅ NEW
  deleteProduct,
  searchProducts,
  updateProduct,
  updateStock,
  getLowStockProducts,
  imageSearch,
  downloadStockExcel
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");


/* LOW STOCK */
/* LOW STOCK */
router.get(
  "/low-stock",
  authMiddleware,
  roleMiddleware("admin","manager"), // ✅ FIXED
  getLowStockProducts
);
/* CREATE PRODUCT */
router.post("/", authMiddleware, roleMiddleware("admin", "manager"), upload.single("image"), createProduct);

/* GET ALL PRODUCTS */
router.get("/", getProducts);

/* SEARCH */
router.get("/search", searchProducts);

/* 🔥 NEW - CATEGORY PRODUCTS */
router.get("/category/:categoryId", getProductsByCategory);

/* SUBCATEGORY PRODUCTS */
router.get("/subcategory/:subCategoryId", getProductsBySubCategory);

/* UPDATE */
router.put("/:id", authMiddleware, roleMiddleware("admin", "manager"), upload.single("image"), updateProduct);

/* DELETE */
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteProduct);

/* STOCK */
router.patch("/stock/:id", authMiddleware, roleMiddleware("admin", "staff"), updateStock);

// 📸 IMAGE SEARCH
router.post("/image-search", upload.single("image"), imageSearch);

router.get(
  "/stock-excel",
  authMiddleware,
  roleMiddleware("admin"),
  downloadStockExcel
);


module.exports = router;