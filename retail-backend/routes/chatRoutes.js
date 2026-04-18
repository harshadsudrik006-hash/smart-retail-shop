const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

/* =========================
   🧠 INTENT DETECTION
========================= */
function detectIntent(msg) {
  if (/^(hi|hello|hey|hii)$/i.test(msg)) return "greet";
  if (msg.includes("help")) return "help";
  if (msg.match(/cheap|budget|low/)) return "cheap";
  if (msg.match(/\d+/)) return "budget";
  if (msg.includes("address")) return "address";
  if (msg.includes("order")) return "order";
  if (msg.includes("payment") || msg.includes("pay")) return "payment";
  if (msg.includes("category") || msg.includes("items")) return "category";
  if (msg.match(/best|top|recommended/)) return "recommend";
  if (msg.match(/offer|deal|discount/)) return "deal";
  if (msg.match(/milk|bread|egg|daily/)) return "daily";
  if (msg.includes("not found") || msg.includes("not finding")) return "retry";
  return "search";
}

/* =========================
   🧠 DATA EXTRACTION
========================= */
function extractData(msg) {
  const priceMatch = msg.match(/(\d+)/);
  const price = priceMatch ? parseInt(priceMatch[0]) : null;

  let keyword = msg
    .replace(/\d+/g, "")
    .replace(/(under|below|rupees|rs|show|me|i|want|need|find|search|for|the|not|finding)/g, "")
    .trim();

  return { keyword, price };
}

/* =========================
   🚀 MAIN ROUTE
========================= */
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const msg = message.toLowerCase().trim();

    const intent = detectIntent(msg);
    const { keyword, price } = extractData(msg);

    /* =========================
       🟢 GREETING
    ========================= */
    if (intent === "greet") {
      return res.json({
        type: "text",
        reply:
`👋 Hey there!

I’m your Smart Shopping Assistant 🛒

I can help you:
• Find products 🔍
• Suggest deals 💸
• Shop by budget 💰

👉 Try:
• "rice under 200"
• "cheap snacks"
• "best oil"

What do you want today? 😊`
      });
    }

    /* =========================
       🟢 HELP
    ========================= */
    if (intent === "help") {
      return res.json({
        type: "text",
        reply:
`🤖 I can help you with:

• Product search
• Budget shopping
• Best deals
• Daily items

👉 Try:
• "milk"
• "atta under 300"
• "cheap products"`
      });
    }

    /* =========================
       🟢 ADDRESS
    ========================= */
    if (intent === "address") {
      return res.json({
        type: "text",
        reply:
`📍 How to add address:

1️⃣ Go to Profile  
2️⃣ Add Address  
3️⃣ Save  

✅ Done!`
      });
    }

    /* =========================
       🟢 ORDER
    ========================= */
    if (intent === "order") {
      return res.json({
        type: "text",
        reply:
`🛒 How to place order:

1️⃣ Search product  
2️⃣ Add to cart  
3️⃣ Checkout  
4️⃣ Payment  

🎉 Done!`
      });
    }

    /* =========================
       🟢 PAYMENT
    ========================= */
    if (intent === "payment") {
      return res.json({
        type: "text",
        reply:
`💳 Payment options:

• UPI  
• Card  
• COD`
      });
    }

    /* =========================
       🟢 RECOMMENDED
    ========================= */
    if (intent === "recommend") {
      const products = await Product.find().sort({ rating: -1 }).limit(5);

      return res.json({
        type: "list",
        title: "⭐ Recommended",
        data: products
      });
    }

    /* =========================
       🟢 DEALS
    ========================= */
    if (intent === "deal") {
      const deals = await Product.find().sort({ price: 1 }).limit(5);

      return res.json({
        type: "list",
        title: "🔥 Best Deals",
        data: deals
      });
    }

    /* =========================
       🟢 DAILY
    ========================= */
    if (intent === "daily") {
      const items = await Product.find({
        name: { $regex: "milk|bread|egg", $options: "i" }
      }).limit(5);

      return res.json({
        type: "list",
        title: "🥛 Daily Essentials",
        data: items
      });
    }

    /* =========================
       🟢 SMART SEARCH (FINAL FIX)
    ========================= */

    // 🔥 CASE 1: ONLY PRICE (under 500, 200, etc.)
    if (price && !keyword) {

      const products = await Product.find({
        price: { $lte: price }
      }).limit(20);

      if (products.length > 0) {
        return res.json({
          type: "products",
          title: `🛒 Products under ₹${price}`,
          data: products
        });
      }
    }

    // 🔥 CASE 2: KEYWORD + PRICE
    let query = {
      name: { $regex: keyword.split(" ").join("|"), $options: "i" }
    };

    if (price) {
      query.price = { $lte: price };
    }

    let products = await Product.find(query).limit(10);

    if (products.length > 0) {
      return res.json({
        type: "products",
        title: price
          ? `🛒 ${keyword} under ₹${price}`
          : `🛒 Results for "${keyword}"`,
        data: products
      });
    }

    /* =========================
       🟢 SUBCATEGORY
    ========================= */
    const sub = await SubCategory.findOne({
      name: { $regex: keyword, $options: "i" }
    });

    if (sub) {
      const subProducts = await Product.find({
        subCategory: sub._id
      }).limit(5);

      return res.json({
        type: "list",
        title: `📂 ${sub.name}`,
        data: subProducts
      });
    }

    /* =========================
       🟢 CATEGORY
    ========================= */
    const category = await Category.findOne({
      name: { $regex: keyword, $options: "i" }
    });

    if (category) {
      const catProducts = await Product.find({
        category: category._id
      }).limit(5);

      return res.json({
        type: "list",
        title: `📦 ${category.name}`,
        data: catProducts
      });
    }

    /* =========================
       🔴 FALLBACK
    ========================= */
    const cats = await Category.find().limit(5);

    const suggestions = await Product.find()
      .sort({ stock: -1 })
      .limit(5);

    return res.json({
      type: "rich",
      reply:
`😕 Product not found.

👉 Try:
• rice, atta, oil
• milk, bread, snacks

💡 Or type:
• under 500
• cheap products

👇 Popular items:`,

      suggestions: suggestions,
      categories: cats.map(c => c.name)
    });

  } catch (err) {
    console.log("CHAT ERROR:", err);
    res.status(500).json({ error: "Chatbot error" });
  }
});

module.exports = router;