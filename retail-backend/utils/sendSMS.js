const axios = require("axios");

const sendSMS = async (number, message) => {
  try {

    let cleanNumber = number.toString().replace(/\D/g, "");

    if (cleanNumber.startsWith("91") && cleanNumber.length > 10) {
      cleanNumber = cleanNumber.slice(-10);
    }

    if (cleanNumber.length !== 10) {
      console.log("❌ INVALID NUMBER:", cleanNumber);
      return; // ❌ throw hata diya
    }

    console.log("📲 Sending SMS to:", cleanNumber);
    console.log("💬 MESSAGE:", message);

    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "v3", // 🔥 FIXED
        message: message,
        language: "english",
        flash: 0,
        numbers: cleanNumber
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("📨 FULL RESPONSE:", response.data);

    if (!response.data || response.data.return !== true) {
      console.log("⚠️ SMS FAILED BUT IGNORED");
      return; // ❌ throw hata diya
    }

    console.log("✅ SMS SENT SUCCESSFULLY 🚀");

  } catch (error) {

    console.log(
      "⚠️ SMS ERROR IGNORED:",
      error.response?.data || error.message
    );

    // ❌ throw hata diya
  }
};

module.exports = sendSMS;