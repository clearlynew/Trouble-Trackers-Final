import "./config/env.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes
import complaintRoutes from "./routes/complaints.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import imageUploadRoutes from "./routes/imageupload.js";

const app = express();

// middleware
// Ensure FRONTEND_URL is defined
if (!process.env.FRONTEND_URL) {
  console.error("FRONTEND_URL not set in environment.");
  process.exit(1);
}

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// routes
app.use("/api/complaints", complaintRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/images", imageUploadRoutes);

// config
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI not set in environment.");
  process.exit(1);
}

// connect DB + start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
