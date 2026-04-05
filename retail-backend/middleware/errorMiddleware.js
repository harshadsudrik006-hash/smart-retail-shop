const errorMiddleware = (err, req, res, next) => {

  console.error("ERROR:", err);

  res.status(500).json({
    message: err.message || "Server Error"
  });

};

module.exports = errorMiddleware;