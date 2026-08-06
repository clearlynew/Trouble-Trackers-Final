// middleware/superAdmin.js
import User from "../models/User.js";

const superAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res.status(403).json({
        message: "Access denied. Superadmin only.",
      });
    }
    next();
  } catch {
    return res.status(500).json({
      message: "Server error checking superadmin role.",
    });
  }
};

export default superAdmin;
