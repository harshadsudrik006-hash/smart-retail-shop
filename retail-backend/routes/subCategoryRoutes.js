const express = require("express");
const router = express.Router();

const {
  createSubCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  deleteSubCategory
} = require("../controllers/subCategoryController");

router.post("/", createSubCategory);

router.get("/", getSubCategories);

router.get("/category/:categoryId", getSubCategoriesByCategory);

router.delete("/:id", deleteSubCategory);

module.exports = router;