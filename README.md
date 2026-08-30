# Hostel Complaint Management System (Trouble Trackers)

## Project Overview

The **Hostel Complaint Management System** is a full-stack web application built to digitize and streamline registering, tracking, and resolving hostel-related complaints. It replaces manual, fragmented complaint handling with a centralized, transparent, and secure platform for students and hostel administration.

Developed as an **academic group project (Team 12)**, with a focus on operational efficiency, communication, and facility management within college hostels.

---

## Problem Statement

Traditional hostel complaint handling suffers from:

* No centralized platform
* Slow, untracked resolution
* Poor prioritization of issues
* Communication gaps between students and administrators

This system addresses these through automation, role-based access, and real-time status tracking.

---

## Objectives

* Manage complaint records efficiently
* Enable real-time complaint status tracking
* Ensure faster issue resolution
* Improve hostel facility management
* Enhance communication between students and administration

---

## Key Features

### Student Module
* Secure authentication with JWT access and refresh tokens
* Complaint submission with category, description, and image attachments
* Duplicate-complaint detection
* Upvoting on complaints to signal community priority
* Sort complaints by votes (priority) or recency
* Real-time status tracking (Pending → In Progress → Resolved / Rejected)
* Paginated complaint history and complaint board

### Admin / Warden Module
* Paginated dashboard to view and manage complaints
* Assign complaints to relevant admins
* Update complaint status
* Broadcast notifications to multiple recipients

### System Features
* Role-based access control (Student / Admin / Superadmin)
* Email confirmation on complaint submission plus in-app notifications on status changes
* Centralized digital complaint records with timestamps for tracking and reporting
* Automatic image cleanup from storage when a complaint is deleted

---

## Technology Stack

### Frontend
* React.js + TypeScript
* Vite
* Tailwind CSS
* Custom React hooks for data fetching, filtering, and notifications

### Backend
* Node.js + Express.js
* RESTful API design
* Nodemailer for email notifications
* express-rate-limit for request throttling
* Jest + Supertest for automated testing

### Database
* MongoDB (MongoDB Atlas)
* Mongoose ODM

### Media & File Handling
* ImageKit for secure image upload, storage, and delivery

### Security
* JWT authentication with access and refresh tokens
* bcrypt password hashing
* Role-based middleware for route protection
* CORS configuration
* Rate-limited authentication endpoints

### Deployment & Tools
* Git & GitHub for version control
* Cloud hosting (Render / Vercel)

---

## System Architecture

1. **Presentation Layer** – React.js UI for complaint submission, tracking, and admin management
2. **Application Layer** – Node.js & Express.js handling business logic, authentication, and routing
3. **Data Access Layer** – Mongoose models for validated, structured CRUD operations
4. **Database Layer** – MongoDB Atlas for persistent cloud storage

---

## Functional Requirements

* User authentication (Student / Admin / Superadmin) with token refresh
* Complaint submission with optional image attachments
* Real-time complaint tracking with paginated views
* Admin dashboard for complaint management and assignment
* In-app and email notification system
* Complaint history maintenance

---

## Non-Functional Requirements

* **Usability:** Intuitive UI requiring no training
* **Performance:** Paginated queries keep response times fast as data grows
* **Security:** JWT, bcrypt, role-based access control, and rate limiting
* **Reliability:** Automated tests cover core authentication and complaint workflows
* **Scalability:** Modular architecture designed for future growth
* **Portability:** Works on all modern browsers and mobile devices

---

## Installation & Setup

### Prerequisites
* Node.js (v18+)
* MongoDB / MongoDB Atlas
* Git

### Steps

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
npm install
```

Create a `.env` file based on `.env.example` and configure your environment variables.

Run the application:

```bash
npm start
```

Run the automated test suite:

```bash
npm test
```

---

## Future Enhancements
* Real-time notifications via WebSockets
* QR code-based complaint registration
* Analytics dashboard for resolution time and complaint trends