exports.validateOrder = (req, res, next) => {

  const { address } = req.body;

  if (!address) {
    return res.status(400).json({
      message: "Delivery address required"
    });
  }

  next();
};