// models/Complaint.js

import mongoose from "mongoose";

const DOMAINS = [
  "Maintenance",
  "Cleanliness",
  "Food",
  "Internet",
  "Security",
];

const ComplaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    domain: {
      type: String,
      enum: DOMAINS,
      required: true,
    },

    // Updated from [String] to store structural ImageKit metadata objects
    images: [
      {
        url: { type: String, required: true },
        fileId: { type: String, required: true }
      }
    ],

    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "rejected"],
      default: "pending",
    },

    votedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

ComplaintSchema.virtual("votes").get(function () {
  return this.votedBy.length;
});

export default mongoose.model("Complaint", ComplaintSchema);