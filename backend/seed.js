// seed.js

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import {
  mockUsers,
  mockComplaints,
  mockNotifications,
} from "./data/mockData.js";

import User from "./models/User.js";
import Complaint from "./models/Complaint.js";
import Notification from "./models/Notification.js";

const mongoURI = process.env.MONGO_URI;

const SALT_ROUNDS = 10;

async function seed() {
  try {
    await mongoose.connect(mongoURI);

    console.log("MongoDB connected.");

    // Clear existing collections
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Notification.deleteMany({});

    console.log("Existing data cleared.");

    // Hash passwords
    const usersToInsert = [];

    for (const user of mockUsers) {
      const hashedPassword = await bcrypt.hash(
        user.password,
        SALT_ROUNDS
      );

      usersToInsert.push({
        ...user,
        passwordHash: hashedPassword,
      });

      delete usersToInsert[usersToInsert.length - 1].password;
    }

    // Insert mock data
    await User.insertMany(usersToInsert);

    await Complaint.insertMany(mockComplaints);

    await Notification.insertMany(mockNotifications);

    console.log("Mock data inserted successfully.");
  } catch (err) {
    console.error("MongoDB seeding error:", err);
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
  }
}

seed();