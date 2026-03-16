const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {
  console.log("AUTH:", req.headers.authorization);
  try {
    // Expect header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Invalid token format",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach admin info to request
    req.adminId = decoded.adminId;

    next(); // ✅ allow request to continue
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }
};

module.exports = authMiddleware;
