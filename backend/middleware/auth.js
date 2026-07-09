import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET not set");
  process.exit(1);
}

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user profile information down to request stream
    req.user = decoded.user;
    req.userId = decoded.user._id;

    next();
  } catch (err) {
    // Return a 403 Forbidden to alert frontend that the token has expired/is invalid
    return res.status(403).json({
      message: "Token is not valid.",
    });
  }
};

export default auth;