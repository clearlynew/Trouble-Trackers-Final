// data/mockData.js

import mongoose from "mongoose";

const ids = {
  users: {
    hima: new mongoose.Types.ObjectId(),
    rinu: new mongoose.Types.ObjectId(),
    saranya: new mongoose.Types.ObjectId(),
    lanka: new mongoose.Types.ObjectId(),

    adminMaintenance: new mongoose.Types.ObjectId(),
    adminInternet: new mongoose.Types.ObjectId(),
    adminFood: new mongoose.Types.ObjectId(),
    adminCleanliness: new mongoose.Types.ObjectId(),

    superAdmin: new mongoose.Types.ObjectId(),
  },

  complaints: {
    ac: new mongoose.Types.ObjectId(),
    leakage: new mongoose.Types.ObjectId(),
    food: new mongoose.Types.ObjectId(),
    wifi: new mongoose.Types.ObjectId(),
    cleanliness: new mongoose.Types.ObjectId(),
  },
};

// Updated image configuration layout to mimic a real ImageKit structural payload
const mockImageObject = {
  url: "https://ik.imagekit.io/uvzn5qbpl/andrea-davis-NngNVT74o6s-unsplash.jpg?updatedAt=1761052400439",
  fileId: "mock_legacy_seed_asset_id_101"
};

export const mockUsers = [
  {
    _id: ids.users.hima,
    name: "Hima Prasobh",
    email: "hima23bcs86@iiitkottayam.ac.in",
    password: "password123",
    role: "student",
    room: "204",
    complaintsSubmitted: 2,
    status: "active",
  },

  {
    _id: ids.users.rinu,
    name: "Rinu Ann Varghese",
    email: "rinu23bcs29@iiitkottayam.ac.in",
    password: "password123",
    role: "student",
    room: "312",
    complaintsSubmitted: 1,
    status: "active",
  },

  {
    _id: ids.users.saranya,
    name: "Saranya K",
    email: "saranya23bcs179@iiitkottayam.ac.in",
    password: "password123",
    role: "student",
    room: "156",
    complaintsSubmitted: 1,
    status: "active",
  },

  {
    _id: ids.users.lanka,
    name: "Lanka Sruthi",
    email: "sruthi23bcd50@iiitkottayam.ac.in",
    password: "password123",
    role: "student",
    room: "118",
    complaintsSubmitted: 1,
    status: "active",
  },

  {
    _id: ids.users.adminMaintenance,
    name: "Arun Nair",
    email: "maintenance.admin@iiitkottayam.ac.in",
    password: "password123",
    role: "admin",
    category: "Maintenance",
    status: "active",
  },

  {
    _id: ids.users.adminInternet,
    name: "Anil Menon",
    email: "internet.admin@iiitkottayam.ac.in",
    password: "password123",
    role: "admin",
    category: "Internet",
    status: "active",
  },

  {
    _id: ids.users.adminFood,
    name: "Meera Joseph",
    email: "food.admin@iiitkottayam.ac.in",
    password: "password123",
    role: "admin",
    category: "Food",
    status: "active",
  },

  {
    _id: ids.users.adminCleanliness,
    name: "Suresh Pillai",
    email: "cleanliness.admin@iiitkottayam.ac.in",
    password: "password123",
    role: "admin",
    category: "Cleanliness",
    status: "active",
  },

  {
    _id: ids.users.superAdmin,
    name: "Super Admin",
    email: "superadmin@iiitkottayam.ac.in",
    password: "password123",
    role: "superadmin",
    status: "active",
  },
];

export const mockComplaints = [
  {
    _id: ids.complaints.ac,
    title: "Broken AC in Room 204",
    description: "The air conditioning unit in room 204 has been making loud noises and is not cooling properly.",
    domain: "Maintenance",
    images: [mockImageObject], // Updated mapping to use structural metadata objects
    status: "pending",
    votedBy: [ids.users.rinu, ids.users.lanka],
    submittedBy: ids.users.hima,
    assignedTo: ids.users.adminMaintenance,
  },

  {
    _id: ids.complaints.leakage,
    title: "Water Leakage in Bathroom",
    description: "There is continuous water leakage from the ceiling in the common bathroom on the 3rd floor.",
    domain: "Maintenance",
    images: [mockImageObject], // Updated mapping
    status: "in-progress",
    votedBy: [ids.users.hima, ids.users.lanka],
    submittedBy: ids.users.rinu,
    assignedTo: ids.users.adminMaintenance,
  },

  {
    _id: ids.complaints.food,
    title: "Poor Food Quality in Mess",
    description: "The food served in the mess has been consistently poor quality for the past week.",
    domain: "Food",
    images: [mockImageObject], // Updated mapping
    status: "resolved",
    votedBy: [ids.users.hima, ids.users.rinu, ids.users.saranya],
    submittedBy: ids.users.hima,
    assignedTo: ids.users.adminFood,
    resolvedAt: new Date(),
  },

  {
    _id: ids.complaints.wifi,
    title: "WiFi Connection Issues",
    description: "Internet connection has been very slow in block B and keeps disconnecting.",
    domain: "Internet",
    images: [mockImageObject], // Updated mapping
    status: "pending",
    votedBy: [ids.saranya],
    submittedBy: ids.users.lanka,
    assignedTo: ids.users.adminInternet,
  },

  {
    _id: ids.complaints.cleanliness,
    title: "Dirty Common Areas",
    description: "The common lounge and study areas are not being cleaned regularly.",
    domain: "Cleanliness",
    images: [mockImageObject], // Updated mapping
    status: "rejected",
    votedBy: [ids.users.rinu],
    submittedBy: ids.users.hima,
    assignedTo: ids.users.adminCleanliness,
  },
];

export const mockNotifications = [
  {
    recipient: ids.users.hima,
    complaint: ids.complaints.food,
    type: "success",
    title: "Complaint Resolved",
    message: 'Your complaint "Poor Food Quality in Mess" has been resolved.',
    isRead: false,
  },

  {
    recipient: ids.users.hima,
    complaint: ids.complaints.ac,
    type: "info",
    title: "Status Update",
    message: 'Your complaint "Broken AC in Room 204" is now being processed.',
    isRead: false,
  },

  {
    recipient: ids.users.hima,
    complaint: ids.complaints.cleanliness,
    type: "error",
    title: "Complaint Rejected",
    message: 'Your complaint "Dirty Common Areas" was rejected due to insufficient evidence provided.',
    isRead: false,
  },

  {
    recipient: ids.users.rinu,
    complaint: ids.complaints.leakage,
    type: "warning",
    title: "Pending Review",
    message: "Your recent complaint requires additional information.",
    isRead: true,
  },

  {
    recipient: ids.users.adminInternet,
    complaint: ids.complaints.wifi,
    type: "info",
    title: "New Complaint Assigned",
    message: "A new internet complaint has been assigned to you.",
    isRead: false,
  },

  {
    recipient: ids.users.superAdmin,
    complaint: null,
    type: "info",
    title: "System Notice",
    message: "System operating normally across all complaint domains.",
    isRead: false,
  },
];