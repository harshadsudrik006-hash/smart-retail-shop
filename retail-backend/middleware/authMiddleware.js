// const jwt = require("jsonwebtoken");

// // DB import 
// const AdminUser = require("../models/User");
// const { userDB } = require("../config/db");

// const authMiddleware = async (req, res, next) => {
//   try {

//     const authHeader = req.headers.authorization;

//     console.log("AUTH HEADER:", authHeader);

//     if (!authHeader) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     if (!authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Invalid token format" });
//     }

//     const token = authHeader.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({ message: "Token missing" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     console.log("DECODED USER:", decoded);

//     let user = null;

//     // admin DB check
//     user = await AdminUser.findById(decoded.id);

//     // user DB check
//     if (!user) {
//       try {
//         const UserModel = userDB.model("User");
//         user = await UserModel.findById(decoded.id);
//       } catch (err) {
//         console.log("UserDB error:", err.message);
//       }
//     }

//     if (!user) {
//       return res.status(401).json({ message: "User not found ❌" });
//     }

//     console.log("✅ USER EMAIL:", user.email);
//     console.log("✅ USER ROLE:", user.role);

//     if (!user.role) {
//       user.role = "user";
//     }

//     req.user = user;

//     next();

//   } catch (error) {

//     console.log("❌ AUTH ERROR:", error);

//     return res.status(401).json({
//       message: "Invalid or expired token",
//       error: error.message
//     });

//   }
// };

// module.exports = authMiddleware;



const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found ❌" });
    }

    if (!user.role) {
      user.role = "user";
    }

    req.user = user;

    next();

  } catch (error) {
    console.log("❌ AUTH ERROR:", error.message);
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;