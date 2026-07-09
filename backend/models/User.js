import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "superadmin"],
      required: true,
    },
    // Only set for admins the complaint domain they manage
    // null for students and superadmin (superadmin manages everything)
    category: {
      type: String,
      enum: ["Maintenance", "Cleanliness", "Food", "Internet", "Security"],
      default: null,
    },
    // Only set for students , their room number
    room: {
      type: String,
      default: null,
      trim: true,
    },
    complaintsSubmitted: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true, // gives you createdAt and updatedAt for free
  }
);

// Strip passwordHash from every API response automatically.
// This means res.json(user) will never accidentally leak the hash.
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

export default mongoose.model("User", UserSchema);