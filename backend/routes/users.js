import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";
import superAdminMiddleware from "../middleware/superAdmin.js";

const router = express.Router();

// Apply authMiddleware globally to all routes (users must be logged in)
router.use(authMiddleware);

/* ==========================================
   🔓 OPEN ROUTES (Any Logged-In User)
   ========================================== */

// Get user by ID (Used by frontend dashboard to display card submitters/assignees)
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ==========================================
   🔒 ADMIN-ONLY ROUTES (view access)
   ========================================== */

// Get all users (Paginated) — admin or superadmin can view
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select("-passwordHash")
        .skip(skip)
        .limit(limit),
      User.countDocuments()
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      users,
      total,
      page,
      totalPages
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ==========================================
   🔒🔒 SUPERADMIN-ONLY ROUTES (mutations)
   ========================================== */

// Create new user
router.post("/", superAdminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role, category, room } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    if (!password || password.trim().length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = new User({
      name,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role,
      category,
      room,
      status: "active",
      tokenVersion: 0
    });

    const newUser = await user.save();

    const userResponse = newUser.toJSON();
    delete userResponse.passwordHash;

    res.status(201).json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user
router.patch("/:id", superAdminMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const { name, email, password, role, category, room } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (room) updateData.room = room;
    if (role) updateData.role = role;

    if (password) {
      if (password.trim().length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long." });
      }
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
      updateData.$inc = { tokenVersion: 1 };
    }

    if (email) {
      updateData.email = email.trim().toLowerCase();
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Toggle user status
router.patch("/:id/toggle-status", superAdminMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = user.status === "active" ? "inactive" : "active";
    user.tokenVersion += 1;

    await user.save();

    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete("/:id", superAdminMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
