import express from "express";
import mongoose from "mongoose";

import Notification from "../models/Notification.js";

import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";

const router = express.Router();

// protect all notification routes

router.use(authMiddleware);

// Create notification

router.post("/", adminMiddleware, async (req, res) => {
  try {
    const { recipient, complaint, type, title, message } = req.body;

    // Since this is admin-only, we proceed directly to creation
    const newNotification = await Notification.create({
      recipient,
      complaint,
      type,
      title,
      message,
      isRead: false,
    });

    res.status(201).json(newNotification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Send notifications to multiple users

router.post(
  "/send-multiple",

  adminMiddleware,

  async (req, res) => {
    const {
      notification,
      recipientIds,
    } = req.body;

    if (
      !notification ||
      !recipientIds ||
      !Array.isArray(recipientIds) ||
      recipientIds.length === 0
    ) {
      return res.status(400).json({
        error:
          "Notification and at least one recipient ID are required.",
      });
    }

    try {
      const notificationsToInsert =
        recipientIds.map((id) => ({
          ...notification,

          recipient: id,
        }));

      const createdNotifs =
        await Notification.insertMany(
          notificationsToInsert
        );

      res.status(201).json(
        createdNotifs
      );
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// Mark all notifications as read

router.put(
  "/mark-all-read",

  async (req, res) => {
    try {
      const updated =
        await Notification.updateMany(
          {
            recipient:
              req.userId,

            isRead: false,
          },

          {
            isRead: true,
          }
        );

      res.json({
        message: `${updated.modifiedCount} notifications marked as read.`,
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// Mark single notification as read
const notif = await Notification.findById(req.params.id);
   if (!notif) return res.status(404).json({ message: "Notification not found" });
   if (notif.recipient.toString() !== req.userId) {
     return res.status(403).json({ message: "Not authorized." });
   }
   // then proceed with update/delete


// Mark single notification as read
router.put(
  "/:id/mark-read",
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: "Invalid notification ID format.",
        });
      }

      const notif = await Notification.findById(req.params.id);

      if (!notif) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      if (notif.recipient.toString() !== req.userId) {
        return res.status(403).json({
          message: "Not authorized to modify this notification.",
        });
      }

      notif.isRead = true;
      const updatedNotif = await notif.save();

      res.json(updatedNotif);
    } catch (err) {
      res.status(400).json({
        error: err.message,
      });
    }
  }
);

// Delete notification
router.delete(
  "/:id",
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: "Invalid notification ID format.",
        });
      }

      const notif = await Notification.findById(req.params.id);

      if (!notif) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      if (notif.recipient.toString() !== req.userId) {
        return res.status(403).json({
          message: "Not authorized to delete this notification.",
        });
      }

      await Notification.findByIdAndDelete(req.params.id);

      res.json({
        message: "Notification deleted",
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// Get notifications for logged-in user

router.get(
  "/my-notifications",

  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          recipient:
            req.userId,
        }).sort({
          createdAt: -1,
        });

      res.json(notifications);
    } catch (err) {
      console.error(
        "Notification fetch error:",
        err.message
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

export default router;