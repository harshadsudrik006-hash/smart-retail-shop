const sendEmail = require("../utils/sendEmail");

exports.sendWelcomeEmail = async (user) => {

  await sendEmail(
    user.email,
    "Welcome to Smart Retail Shop",
    `Hello ${user.name},

Your account has been created successfully.

Thank you for joining Smart Retail Shop.`
  );

};