// testEmail.js
import dotenv from "dotenv";
dotenv.config(); // Load variables from .env file

import { sendEmail } from "../utils/sendEmail.js";

// 🧾 Step 1: Check if environment variables are loaded properly
console.log("🔍 Checking environment variables...");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "❌ Not found");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing");

// 🧾 Step 2: Define recipient and message
const testEmail = async () => {
  const recipient = "your_other_email@gmail.com"; // 👈 Change this to any email you want to test
  const subject = "Test Email from Hostel Management System";
  const message = `
  Hello!

  This is a test email from your Hostel Complaint Management System.
  If you are reading this, your Nodemailer + Gmail setup works perfectly! 🎉

  Regards,
  Hostel Management Bot
  `;

  try {
    console.log("📨 Sending test email...");
    await sendEmail(recipient, subject, message);
    console.log("✅ Test email sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send test email:", error);
  }
};

// Run the test
testEmail();
