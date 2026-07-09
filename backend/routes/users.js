import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";

const router = express.Router();

// Apply middleware globally to all routes in this router
router.use(authMiddleware, adminMiddleware);

// Get all users (Paginated)
router.get("/", async (req, res) => {
  try {
    // Parse pagination parameters with safe defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Run count and query in parallel for performance
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

// Get user by ID
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

// Create new user
router.post("/", async (req, res) => {
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

    // Trim password consistently before hashing
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = new User({
      name,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role,
      category,
      room,
    });

    const newUser = await user.save();
    
    // Safely remove passwordHash before returning response
    const userResponse = newUser.toJSON();
    delete userResponse.passwordHash;

    res.status(201).json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user
router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Destructure explicitly to avoid Mass Assignment
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
router.patch("/:id/toggle-status", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    // Prevent password leak explicitly
    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
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