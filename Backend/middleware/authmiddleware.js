const jwt = require("jsonwebtoken");
const secret = "mdkdfjdhfkjhd@#$%&safh8840505312@!$%#^&*";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        message: "Unauthorized: No token provided or token is not Bearer type",
      });
  }

  const token = authHeader.split(" ")[1]; // Extract the token from "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({
        message: "Unauthorized: Token not found in Authorization header",
      });
  }

  try {
    const decodedToken = jwt.verify(token, secret);

    req.user = decodedToken; // Attach decoded user information to the request object
    next();
  } catch (err) {
    console.error("Authentication error in adminMiddleware:", err.message);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token: Malformed" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid token: Expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
