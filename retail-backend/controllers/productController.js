const Product = require("../models/Product");


// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {

    const {
      name,
      price,
      originalPrice,   // 🔥 ADD
      weight,          // 🔥 ADD
      category,
      subCategory,
      stock,
      description,
      lowStockAlert
    } = req.body;

    const product = await Product.create({
      name,
      price,
      originalPrice,
      weight,
      category,
      subCategory,
      stock,
      description,
      lowStockAlert: lowStockAlert || 10,   
      image: req.file ? req.file.path : ""
    });

    res.json({
      message: "Product created successfully",
      product
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {

  try {

    const products = await Product
      .find()
      .populate("category", "name")
      .populate("subCategory", "name");

    res.json(products);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.updateProduct = async (req, res) => {

  try {

    const { name, price, stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        stock,
        image: req.file ? req.file.path : undefined
      },
      { new: true }
    );

    res.json({
      message: "Product updated successfully",
      product
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// GET PRODUCTS BY SUBCATEGORY
exports.getProductsBySubCategory = async (req, res) => {

  try {

    const products = await Product.find({
      subCategory: req.params.subCategoryId
    });

    res.json(products);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {

  try {

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product deleted"
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// SEARCH PRODUCT
// 🔍 SEARCH PRODUCT (AI + STRICT FIX)
exports.searchProducts = async (req, res) => {
  try {

    const keyword = req.query.q?.toLowerCase();

    if (!keyword) return res.json([]);

    const products = await Product.find();

    const filtered = products.filter(p => {

      const name = p.name.toLowerCase();

      // ✅ exact match
      if (name.includes(keyword)) return true;

      // ✅ typo match (first 3 letters)
      return name.split(" ").some(word =>
        word.startsWith(keyword.slice(0,3))
      );

    });

    res.json(filtered);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 📸 IMAGE SEARCH
exports.imageSearch = async (req, res) => {
  try {

    const filename = req.file.originalname.toLowerCase();

    const products = await Product.find();

    const found = products.find(p =>
      filename.includes(p.name.toLowerCase().split(" ")[0])
    );

    if(found){
      return res.json(found);
    }

    res.json([]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Update Stock
exports.updateStock = async (req, res) => {
  try {

    const { stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found ❌" });
    }

    const oldStock = product.stock;

    // 🔥 SAVE HISTORY
    product.stockHistory.push({
      oldStock,
      newStock: stock
    });

    // 🔥 UPDATE STOCK
    product.stock = stock;

    await product.save();

    res.json({
      message: "Stock updated + history saved ✅",
      product
    });

  } catch (error) {
    console.log("❌ STOCK ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

//Low Stock

exports.getLowStockProducts = async (req, res) => {

  try {

    const products = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockAlert"] }
    });

    // 🔥 ADD THIS (fallback)
    if (products.length === 0) {
      const fallbackProducts = await Product.find({
        stock: { $lte: 10 }
      });

      return res.json(fallbackProducts);
    }

    res.json(products);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


/* GET ALL PRODUCTS */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("subCategory", "name");

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* 🔥 GET PRODUCTS BY CATEGORY */
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryId
    })
    .populate("category", "name")
    .populate("subCategory", "name");

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET PRODUCTS BY SUBCATEGORY */
exports.getProductsBySubCategory = async (req, res) => {
  try {
    const products = await Product.find({
      subCategory: req.params.subCategoryId
    })
    .populate("category", "name")
    .populate("subCategory", "name");

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const ExcelJS = require("exceljs");

exports.downloadStockExcel = async (req, res) => {
  try {

    const products = await Product.find();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Stock Report");

    sheet.columns = [
      { header: "Product Name", key: "name", width: 30 },
      { header: "Stock", key: "stock", width: 10 },
      { header: "Price", key: "price", width: 10 },
      { header: "Updated", key: "date", width: 20 }
    ];

    products.forEach(p => {
      sheet.addRow({
        name: p.name,
        stock: p.stock,
        price: p.price,
        date: new Date(p.updatedAt).toLocaleString()
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=stock-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.log("❌ EXCEL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};