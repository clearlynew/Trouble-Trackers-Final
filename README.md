# Trouble Trackers: Hostel Complaint Management System

A full-stack MERN (TypeScript) web app for registering, tracking and resolving hostel complaints. Students raise and upvote complaints, admins are assigned and resolve them, and a superadmin manages users. Deployed on AWS (EC2, S3, CloudFront).

Built as a 4-person academic team project.

## Features

**Students**
- Submit complaints with a category, description and image attachments
- Duplicate detection: a very similar recent complaint is rejected with a `409`
- Upvote complaints so the most-affected issues rise to the top; sort by votes or recency
- Track status: pending, in-progress, resolved, rejected
- Paginated complaint board and personal history

**Admins**
- Paginated dashboard of complaints
- Assign complaints to an active admin; update status
- Broadcast notifications to multiple recipients

**Superadmin**
- Create, edit, activate/deactivate and delete users and admins

**System**
- Role-based access control (student / admin / superadmin) enforced in middleware
- Email confirmation on submission, plus in-app notifications on status changes
- Images are removed from ImageKit when a complaint is deleted

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, custom hooks |
| Backend | Node.js, Express, REST API |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT access + refresh tokens, bcrypt |
| Media / email | ImageKit, Nodemailer |
| Testing | Jest, Supertest |
| Deployment | AWS EC2 + Nginx + PM2, S3, CloudFront |

## Architecture

```
Browser
   │  HTTPS
   ▼
CloudFront ──── /*      ──▶ S3 (Vite production build)
   │
   └────────── /api/*  ──▶ EC2: Nginx ──▶ Express (PM2) ──▶ MongoDB Atlas
```

CloudFront serves the React build from S3 and forwards `/api/*` to the backend on EC2, so the browser talks to a single HTTPS origin. Full step-by-step deployment notes, including the problems hit along the way, are in [AWS_Setup.md](AWS_Setup.md).

Code layout:

```
backend/
  app.js            Express app, CORS, route mounting
  routes/           auth, complaints, users, notifications, imageupload
  middleware/       auth (JWT), admin, superAdmin
  models/           User, Complaint, Notification
  tests/            Jest + Supertest
frontend/src/
  pages/            Landing, student/admin/superadmin dashboards, logins
  components/       complaint cards, filters, modals, notification panel
  hooks/            data fetching, filtering, notifications
  services/         API client layer
```

## Security

- Passwords hashed with bcrypt
- Access tokens expire in 15 minutes, refresh tokens in 7 days
- Login limited to 10 attempts per 15 minutes per IP (`express-rate-limit`)
- Route protection through role middleware; students can only edit their own complaints, and only superadmins can manage users
- CORS restricted to the configured `FRONTEND_URL`
- Secrets live in environment variables; `.env` is not committed

## Tests

Six automated tests (Jest + Supertest) cover authentication and permission rules:

- valid login returns a token; wrong password is rejected
- unauthenticated complaint creation is rejected
- a student cannot edit another student's complaint
- a non-admin cannot create users
- assigning a complaint to an inactive admin is rejected

They cover access control, not every endpoint. Frontend tests are not included.

## Run locally

Prerequisites: Node.js 18+, a MongoDB instance (local or Atlas), an ImageKit account, and an email account for Nodemailer.

```bash
git clone https://github.com/clearlynew/Trouble-Trackers-Final.git
cd Trouble-Trackers-Final

# backend
cd backend
npm install
cp .env.example .env     # fill in the values
npm run dev              # http://localhost:5000

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

Backend environment variables (see `backend/.env.example`): `PORT`, `MONGO_URI`, `JWT_SECRET`, `REFRESH_SECRET`, `JWT_EXPIRE`, `NODE_ENV`, `EMAIL_USER`, `EMAIL_PASS`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `FRONTEND_URL`.

Seed sample data with `node seed.js` from `backend/`. Run the tests with `npm test` from `backend/` (needs a local MongoDB for `MONGO_URI_TEST`).

## Limitations and future work

- Notifications are fetched on demand; real-time delivery (WebSockets) is not implemented
- The backend runs on a single EC2 instance with no autoscaling or load balancer
- Test coverage is limited to auth and permission paths
- Ideas: QR-code complaint registration, analytics on resolution time and complaint trends
