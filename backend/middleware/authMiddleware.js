const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = (req.header("Authorization") || "").trim();
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  let token = String(bearerMatch ? bearerMatch[1] : authHeader)
    .trim()
    .replace(/^"|"$/g, "");
  token = token.replace(/^Bearer\s+/i, "").trim();

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const candidateSecrets = [process.env.JWT_SECRET, "your_jwt_secret"].filter(Boolean);
    let decoded = null;

    for (const secret of candidateSecrets) {
      try {
        decoded = jwt.verify(token, secret);
        break;
      } catch (verifyError) {
        decoded = null;
      }
    }

    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = authMiddleware;
