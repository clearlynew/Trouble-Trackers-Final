import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    // "recipient" is clearer than "userId" — immediately obvious who this is for
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Links the notification back to the complaint it is about.
    // Lets you navigate to the complaint when the user taps the notification.
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null, // null for system-wide notifications not tied to a complaint
    },
    type: {
      type: String,
      enum: ["success", "info", "warning", "error"],
      default: "info",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt replaces the manual timestamp field
  }
);

export default mongoose.model("Notification", NotificationSchema);