import User from "../models/User.js";

const admin = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.userId
    );

    if (
      !user ||
      !["admin", "superadmin"].includes(
        user.role
      )
    ) {
      return res.status(403).json({
        message:
          "Access denied. Admins only.",
      });
    }

    next();
  } catch {
    return res.status(500).json({
      message:
        "Server error checking admin role.",
    });
  }
};

export default admin;