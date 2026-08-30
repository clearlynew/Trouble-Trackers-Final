import express from "express";
import mongoose from "mongoose";

import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";

import { sendEmail } from "../utils/sendEmail.js";
import imagekit from "../utils/imagekit.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get all complaints (Paginated)
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Parse pagination parameters with safe defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Run count and query in parallel for performance
    const [complaints, total] = await Promise.all([
      Complaint.find()
        .populate("submittedBy", "name email")
        .populate("assignedTo", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }), // Sort by newest first by default
      Complaint.countDocuments()
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      complaints,
      total,
      page,
      totalPages
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get complaint by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid complaint ID." });
    }
    const complaint = await Complaint.findById(req.params.id)
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email");
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create complaint
router.post("/", authMiddleware, async (req, res) => {
  try {
    const studentId = req.userId;
    const { title, description, domain, images } = req.body;

    const dailyLimit = 5;
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const complaintsToday = await Complaint.countDocuments({
      submittedBy: studentId,
      createdAt: { $gte: startOfToday },
    });

    if (complaintsToday >= dailyLimit) {
      return res.status(429).json({ message: `You have reached your daily limit of ${dailyLimit} complaints.` });
    }

    const recentComplaints = await Complaint.find({
      submittedBy: studentId,
      createdAt: { $gte: sevenDaysAgo },
    }).select("title description domain");

    const newTitle = title.trim().toLowerCase();
    const newDescription = description.trim().toLowerCase();

   const isDuplicate = recentComplaints.some((existingComplaint) => {
     const existingTitle = existingComplaint.title.trim().toLowerCase();
     const existingDescription = existingComplaint.description.trim().toLowerCase();
     return existingTitle === newTitle && existingDescription === newDescription && existingComplaint.domain === domain;
   });

    if (isDuplicate) {
      return res.status(409).json({ message: "A very similar complaint has already been submitted recently." });
    }

    const complaint = new Complaint({
      title,
      description,
      domain,
      images,
      submittedBy: studentId,
      status: "pending",
      votedBy: [],
    });

    const newComplaint = await complaint.save();

    // Increment user statistics
    await User.findByIdAndUpdate(studentId, { $inc: { complaintsSubmitted: 1 } });

    const complaintIDShort = newComplaint._id.toString().slice(-6);
    const student = await User.findById(studentId);

    if (student?.email) {
      const emailSubject = `Complaint Received: #${complaintIDShort}`;
      const emailMessage = `Hi ${student.name},\n\nWe have successfully received your complaint "${newComplaint.title}".\n\nComplaint ID: ${newComplaint._id}\n\nHostel Management`;
      sendEmail(student.email, emailSubject, emailMessage).catch((err) => console.error("Email error:", err));
    }

    await Notification.create({
      recipient: studentId,
      complaint: newComplaint._id,
      type: "success",
      title: `Complaint Submitted: #${complaintIDShort}`,
      message: `Your complaint "${newComplaint.title}" was successfully submitted.`,
      isRead: false,
    });

    res.status(201).json(newComplaint);
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(400).json({ message: err.message });
  }
});

// Assign complaint
router.put("/:id/assign", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { assignee } = req.body;
    if (!assignee) return res.status(400).json({ message: "Assignee ID is required." });
    if (!mongoose.Types.ObjectId.isValid(assignee)) return res.status(400).json({ message: "Invalid format for assignee ID." });

    const assignedUser = await User.findById(assignee);
    if (!assignedUser) return res.status(404).json({ message: "Assigned user not found." });

    // Check if user is active
    if (assignedUser.status !== "active") {
      return res.status(400).json({ message: "Cannot assign to an inactive user." });
    }

    if (!["admin", "superadmin"].includes(assignedUser.role)) {
      return res.status(400).json({ message: "Cannot assign to non-admin user." });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo: assignee, status: "in-progress" },
      { new: true }
    );

    if (!updatedComplaint) return res.status(404).json({ message: "Complaint not found." });

    const submitterId = updatedComplaint.submittedBy.toString();
    const adminUsers = await User.find({ role: { $in: ["admin", "superadmin"] } });
    const adminIds = adminUsers.map((user) => user._id.toString());
    const uniqueRecipients = new Set([submitterId, assignee, req.userId, ...adminIds]);

    const assignedName = assignedUser?.name || "Staff";
    const notificationsToInsert = Array.from(uniqueRecipients).map((uid) => {
      let title = "Complaint Assigned";
      let message;
      if (uid === submitterId) {
        message = `Your complaint "${updatedComplaint.title}" has been assigned to ${assignedName} and is now in progress.`;
      } else if (uid === assignee) {
        title = "New Assignment Received";
        message = `You have been assigned complaint "${updatedComplaint.title}".`;
      } else {
        title = "Assignment Logged";
        message = `Complaint "${updatedComplaint.title}" has been assigned successfully.`;
      }
      return { recipient: uid, complaint: updatedComplaint._id, type: "warning", title, message, isRead: false };
    });

    await Notification.insertMany(notificationsToInsert);
    res.json(updatedComplaint);
  } catch (err) {
    console.error("Error assigning complaint:", err);
    res.status(500).json({ message: "Server error during assignment." });
  }
});

// Update complaint status
router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const updateData = { status };
    if (status === "resolved") updateData.resolvedAt = new Date();

    const updatedComplaint = await Complaint.findByIdAndUpdate(req.params.id, updateData, { new: true });

    await Notification.create({
      recipient: complaint.submittedBy,
      complaint: complaint._id,
      type: status === "resolved" ? "success" : status === "rejected" ? "error" : "info",
      title: "Complaint Status Updated",
      message: `Your complaint "${complaint.title}" is now ${status}.`,
    });

    res.json(updatedComplaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vote toggle
// Vote toggle (Fixed with logging and array safety check)
router.patch("/:id/vote", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const votingUser = await User.findById(userId);
    if (!votingUser || votingUser.role !== "student") {
      return res.status(403).json({ message: "Only students may vote." });
    }

    // Try to add the vote atomically — only succeeds if not already present
    let updatedComplaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, votedBy: { $ne: userId } },
      { $addToSet: { votedBy: userId } },
      { new: true }
    );

    if (!updatedComplaint) {
      // Either not found, or already voted — try removing the vote atomically instead
      updatedComplaint = await Complaint.findOneAndUpdate(
        { _id: req.params.id, votedBy: userId },
        { $pull: { votedBy: userId } },
        { new: true }
      );
    }

    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(updatedComplaint);
  } catch (err) {
    console.error("VOTE ROUTE ERROR:", err);
    res.status(500).json({ message: "Server error during vote operation.", error: err.message });
  }
});

// Update complaint (Ownership check & Field whitelist)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Ownership check
    if (complaint.submittedBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own complaints." });
    }

    // Field whitelist
    const { title, description, images } = req.body;
    const updateData = { title, description, images };

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedComplaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete complaint
// Delete complaint
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid complaint ID format." });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Loop through existing tracking profiles if cloud files are detected
    if (complaint.images && complaint.images.length > 0) {
      const deletePromises = complaint.images.map((img) => {
        if (img.fileId) {
          return imagekit.deleteFile(img.fileId);
        }
        return Promise.resolve();
      });

      // Execute clear requests concurrently
      // Using allSettled guarantees database pipeline complete clearance even if cloud deletions drop frames
      const deletionResults = await Promise.allSettled(deletePromises);
      
      // Optional logging for debug validation purposes
      deletionResults.forEach((result, idx) => {
        if (result.status === "rejected") {
          console.error(`Failed to delete asset image file: ${complaint.images[idx].fileId} — Error:`, result.reason);
        }
      });
    }

    // Safely remove the document item reference node from primary MongoDB cluster collection storage
    await Complaint.findByIdAndDelete(req.params.id);

    res.json({ message: "Complaint and all associated assets deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;