  const nodemailer = require("nodemailer");

  const sendEmail = async (to, subject, text) => {

    try {

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // use SSL
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"Smart Retail Shop" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text
      };

      const info = await transporter.sendMail(mailOptions);

      console.log("Email sent:", info.response);

    } catch (error) {

      console.error("Email Error:", error.message);

    }

  };

  module.exports = sendEmail;