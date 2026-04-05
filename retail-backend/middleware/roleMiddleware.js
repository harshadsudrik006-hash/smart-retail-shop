// const roleMiddleware = (...roles) => {
//   return (req, res, next) => {
//     try {

//       console.log("🔐 ROLE CHECK:", req.user?.role);

//       if (!req.user || !req.user.role) {
//         return res.status(401).json({
//           message: "Unauthorized ❌"
//         });
//       }

//       const userRole = String(req.user.role).toLowerCase().trim();
//       const allowedRoles = roles.map(r => String(r).toLowerCase().trim());

//       if (!allowedRoles.includes(userRole)) {
//         return res.status(403).json({
//           message: "Access denied ❌"
//         });
//       }

//       next();

//     } catch (error) {
//       console.log("❌ ROLE MIDDLEWARE ERROR:", error);
//       return res.status(500).json({
//         message: "Role middleware failed",
//         error: error.message
//       });
//     }
//   };
// };

// module.exports = roleMiddleware;



const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userRole = req.user.role.toLowerCase();

      if (!roles.map(r => r.toLowerCase()).includes(userRole)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
};

module.exports = roleMiddleware;