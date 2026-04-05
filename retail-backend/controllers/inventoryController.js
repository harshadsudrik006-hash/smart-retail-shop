const Inventory = require("../models/Inventory");

/* ADD / UPDATE STOCK */
exports.updateStock = async (req, res) => {
  try {

    const { productId, stock } = req.body;

    let item = await Inventory.findOne({ product: productId });

    if (!item) {
      item = await Inventory.create({
        product: productId,
        stock
      });
    } else {
      item.stock = stock;
      item.updatedAt = new Date();
      await item.save();
    }

    res.json({ message: "Stock updated ✅", item });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET STOCK */
exports.getStock = async (req, res) => {
  try {

    const data = await Inventory.find().populate("product");

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};