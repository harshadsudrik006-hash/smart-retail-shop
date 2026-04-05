const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

/* =========================
   🧠 INTENT DETECTION
========================= */
function detectIntent(msg) {
  if (/^(hi|hello|hey|hii)$/.test(msg)) return "greet";
  if (msg.includes("help")) return "help";
  if (msg.match(/cheap|budget|low/)) return "cheap";
  if (msg.match(/\d+/)) return "budget";
  if (msg.includes("address")) return "address";
  if (msg.includes("order")) return "order";
  if (msg.includes("payment") || msg.includes("pay")) return "payment";
  if (msg.includes("category") || msg.includes("items")) return "category";
  return "search";
}

/* =========================
   🧠 DATA EXTRACTION
========================= */
function extractData(msg) {
  const priceMatch = msg.match(/\d+/);
  const price = priceMatch ? parseInt(priceMatch[0]) : null;

  // remove useless words
  let keyword = msg
    .replace(/\d+/g, "")
    .replace(/(show|me|i|want|need|find|search|for|the|not|finding)/g, "")
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
           "Hey 👋 How can I help you today?"//\n\nTry:\n• rice\n• oil\n• cheap products\n• under 300"
      });
    }

    /* =========================
       🟢 HELP
    ========================= */
    if (intent === "help") {
      return res.json({
        type: "text",
        reply:
          "🤖 I can help you with:\n• Product search\n• Budget shopping\n• Cheapest products\n\n"
      });
    }

    /* =========================
       🟢 ADDRESS GUIDE
    ========================= */
    if (intent === "address") {
      return res.json({
        type: "text",
        reply:
`📍 How to add address:

1️⃣ Go to Profile / Account  
2️⃣ Click "Add Address"  
3️⃣ Enter your details  
4️⃣ Save  

✅ Now you can place orders easily!`
      });
    }

    /* =========================
       🟢 ORDER GUIDE
    ========================= */
    if (intent === "order") {
      return res.json({
        type: "text",
        reply:
`🛒 How to place order:

1️⃣ Search product  
2️⃣ Click ADD  
3️⃣ Go to Cart  
4️⃣ Click Checkout  
5️⃣ Select address & payment  

🎉 Done!`
      });
    }

    /* =========================
       🟢 PAYMENT GUIDE
    ========================= */
    if (intent === "payment") {
      return res.json({
        type: "text",
        reply:
`💳 Payment options:

• UPI (GPay, PhonePe)
• Cash on Delivery
• Debit/Credit Card`
      });
    }

    /* =========================
       🟢 HANDLE "NOT FOUND RICE"
    ========================= */
    if (msg.includes("not finding") || msg.includes("not found")) {
      const cleanKeyword = msg.replace(/not finding|not found/g, "").trim();

      const products = await Product.find({
        name: { $regex: cleanKeyword, $options: "i" }
      }).limit(5);

      if (products.length > 0) {
        return res.json({
          type: "products",
          title: `🛒 Showing results for "${cleanKeyword}"`,
          data: products.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            image: p.image,
            stock: p.stock
          }))
        });
      }
    }

    /* =========================
       🟢 SMART PRODUCT SEARCH
    ========================= */
    let query = {
      name: { $regex: keyword, $options: "i" }
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
        data: products.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.image,
          stock: p.stock
        }))
      });
    }

    /* =========================
       🟢 CHEAP PRODUCTS
    ========================= */
    if (intent === "cheap") {
      const cheapProducts = await Product.find()
        .sort({ price: 1 })
        .limit(5);

      return res.json({
        type: "list",
        title: "🤑 Cheapest Products",
        data: cheapProducts.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.image
        }))
      });
    }

    /* =========================
       🟢 SUBCATEGORY SEARCH
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
        data: subProducts.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.image
        }))
      });
    }

    /* =========================
       🟢 CATEGORY SEARCH
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
        data: catProducts.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.image
        }))
      });
    }

    /* =========================
       🔴 FINAL FALLBACK
    ========================= */
    const cats = await Category.find().limit(5);

    return res.json({
      type: "text",
      reply:
        "❌ Product not found.\n\n👉 Try categories:\n\n" +
        cats.map(c => `• ${c.name}`).join("\n") +
        "\n\n💡 Example: 'rice' or 'atta'"
    });

  } catch (err) {
    console.log("CHAT ERROR:", err);
    res.status(500).json({ error: "Chatbot error" });
  }
});

module.exports = router;