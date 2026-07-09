import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import User from "../models/User.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET not set");
  process.exit(1);
}

if (!process.env.REFRESH_SECRET) {
  console.error("REFRESH_SECRET not set");
  process.exit(1);
}

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // find user using normalized email
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // check if user exists
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials.",
      });
    }

    // check if account is active
    if (user.status && user.status !== "active") {
      return res.status(403).json({
        message: "Your account is inactive. Please contact administration.",
      });
    }

    // compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials.",
      });
    }

    // create JWT payload including tokenVersion
    const payload = {
      user: {
        _id: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
    };

    // 1. Generate short-lived access token (15 minutes)
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "15m",
    });

    // 2. Generate long-lived refresh token (7 days)
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // 3. Attach refresh token inside an httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Transmit only over HTTPS in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // send response with access token and basic profile metadata
    res.json({
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        category: user.category,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing." });
    }

    // Verify incoming cookie token structure against specialized secret
    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired refresh token." });
      }

      // Re-fetch user from database to check current token state viability
      const user = await User.findById(decoded.user._id);
      
      // Reject if the token has been invalidated (logout-all, password change, deactivation etc.)
      if (!user || user.tokenVersion !== decoded.user.tokenVersion) {
        return res.status(401).json({ message: "Refresh token has been revoked." });
      }

      // Re-sign clean short-lived token layout assets carrying current version
      const newPayload = {
        user: {
          _id: user._id,
          role: user.role,
          tokenVersion: user.tokenVersion,
        },
      };

      const accessToken = jwt.sign(newPayload, JWT_SECRET, { expiresIn: "15m" });
      res.json({ accessToken });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  // Clear cookie mapping footprint cleanly
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({ message: "Logged out successfully" });
});

export default router;