const Order = require("../models/Order");

exports.createOrder = async (data) => {

  const order = await Order.create(data);

  return order;
};