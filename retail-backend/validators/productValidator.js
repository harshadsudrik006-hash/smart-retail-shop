exports.validateProduct = (req, res, next) => {

  const { name, price, category, subCategory, stock } = req.body;

  // Required fields
  if (!name || !price || !category || !subCategory) {
    return res.status(400).json({
      message: "Name, price, category and subCategory are required"
    });
  }

  // Price validation
  if (price <= 0) {
    return res.status(400).json({
      message: "Price must be greater than 0"
    });
  }

  // Stock validation
  if (stock && stock < 0) {
    return res.status(400).json({
      message: "Stock cannot be negative"
    });
  }

  next();
};