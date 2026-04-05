const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/* ================================
   REGISTER USER
================================ */

exports.register = async (req, res) => {

  try {

    console.log("REGISTER API CALLED");

    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      loginType: "normal"
    });

    console.log("User created:", user.email);

    // SEND EMAIL
    await sendEmail(
      email,
      "Welcome to Smart Retail Shop",
      `Hello ${name},

Your account has been created successfully on Smart Retail Shop.

Welcome to our store!

Smart Retail Team`
    );

    console.log("EMAIL SENT");

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {

    console.log("REGISTER ERROR:", error);

    res.status(500).json({
      error: error.message
    });

  }

};



/* ================================
   NORMAL LOGIN
================================ */

exports.login = async (req, res) => {

  try {

    console.log("LOGIN REQUEST BODY:", req.body);

    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // If user registered via Google
    if (!user.password) {
      return res.status(400).json({
        message: "Please login using Google"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role  },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send email but don't break login if email fails
    try {

      await sendEmail(
        user.email,
        "Login Successful - Smart Retail Shop",
        `Hello ${user.name},

You have successfully logged in to Smart Retail Shop.

If this was not you, please change your password immediately.

Smart Retail Team`
      );

    } catch (mailError) {

      console.log("Login email failed:", mailError.message);

    }

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {

    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });

  }

};


/* ================================
   GOOGLE LOGIN
================================ */

// exports.googleLogin = async (req, res) => {

//   try {

//     const { token } = req.body;

//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID
//     });

//     const payload = ticket.getPayload();

//     const email = payload.email;
//     const name = payload.name;
//     const picture = payload.picture;

//     let user = await User.findOne({ email });

//     if (!user) {

//       user = await User.create({
//         name,
//         email,
//         avatar: picture,
//         loginType: "google"
//       });

//     }

//     const jwtToken = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // Try sending email but don't break login if it fails
//     try {

//       await sendEmail(
//         user.email,
//         "Google Login Successful - Smart Retail Shop",
//         `Hello ${user.name},

// You have successfully logged in using your Google account.

// Welcome to Smart Retail Shop.

// Smart Retail Team`
//       );

//     } catch (mailError) {

//       console.log("Google login email failed:", mailError.message);

//     }

//     res.json({
//       message: "Google login successful",
//       token: jwtToken,
//       user
//     });

//   } catch (error) {

//     console.log("GOOGLE LOGIN ERROR:", error);

//     res.status(500).json({
//       error: error.message
//     });

//   }

// };


exports.googleLogin = async (req, res) => {
  try {

    console.log("🔥 Google login API hit");

    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        loginType: "google",
        role: "user"
      });
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔥 ADD THIS PART
    try {
      console.log("📧 Sending email...");
      await sendEmail(
        user.email,
        "Google Login Successful - Smart Retail Shop",
        `Hello ${user.name},

You have successfully logged in using Google.

Welcome to Smart Retail Shop 🚀`
      );
    } catch (err) {
      console.log("❌ Email failed:", err.message);
    }

    res.json({
      message: "Google login successful",
      token: jwtToken,
      user
    });

  } catch (error) {
    console.log("GOOGLE LOGIN ERROR FULL:", error);
    res.status(500).json({
      error: error.message
    });
  }
};



/* ================================
   EMAIL LOGIN (MAGIC LINK)
================================ */

exports.emailLogin = async (req, res) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const loginLink = `http://localhost:4200/email-login/${token}`;

    await sendEmail(
      email,
      "Login Link - Smart Retail Shop",
      `Hello,

Click the link below to login:

${loginLink}

This link will expire in 10 minutes.

Smart Retail Team`
    );

    res.json({
      message: "Login link sent to email"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};



/* ================================
   VERIFY EMAIL LOGIN
================================ */

exports.verifyEmailLogin = async (req, res) => {

  try {

    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const authToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // SEND SUCCESS EMAIL
    await sendEmail(
      user.email,
      "Login Successful",
      `Hello ${user.name},

You have successfully logged in to Smart Retail Shop.

Smart Retail Team`
    );

    res.json({
      message: "Login successful",
      token: authToken,
      user
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};

/* ================================
   UPDATE PROFILE
================================ */

exports.updateProfile = async (req, res) => {

  try {

    console.log("UPDATE PROFILE HIT");

    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        phone
      },
      { new: true }
    );

    console.log("UPDATED USER:", user);

    res.json({
      message: "Profile updated",
      user
    });

  } catch (error) {

    console.log("UPDATE ERROR:", error);

    res.status(500).json({
      error: error.message
    });

  }

};