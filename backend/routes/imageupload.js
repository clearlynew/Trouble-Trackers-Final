import express from "express";
import multer from "multer";

import imagekit from "../utils/imagekit.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// multer config
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WEBP images are allowed."));
    }
  },
});

// upload route
router.post(
  "/upload-images",
  authMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length == 0) {
        return res.status(400).json({
          message: "No images uploaded.",
        });
      }

      const uploadedImages = [];

      for (const file of req.files) {
        const result = await imagekit.upload({
          file: file.buffer.toString("base64"),
          fileName: `${Date.now()}-${file.originalname}`,
          folder: "/complaints",
        });

        // Store both url and fileId explicitly from ImageKit response attributes
        uploadedImages.push({
          url: result.url,
          fileId: result.fileId,
        });
      }

      // Return unified structural payload array matching updated Complaint schema configuration mappings
      res.status(200).json({
        images: uploadedImages,
      });
    } catch (err) {
      console.error("Image upload failed:", err);

      if (err.code == "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "File size must be under 5MB.",
        });
      }

      res.status(500).json({
        error: err.message || "Failed to upload images",
      });
    }
  }
);

export default router;