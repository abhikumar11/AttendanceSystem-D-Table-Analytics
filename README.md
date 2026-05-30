# Attendance Management System

Full-stack MERN attendance management app for employee punch-in/punch-out tracking, manager review, admin oversight, overtime approval, and Excel reporting.

## Setup Instructions

### Prerequisites

- Node.js and npm
- MongoDB local instance or MongoDB Atlas connection string
- Browser camera and location permissions for attendance punch actions

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/attendance-management
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

For production-style local start:

```bash
npm start
```

### Frontend

```bash
cd client
npm install
```

Create `client/.env` if the API is not running on the default backend URL:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

## Architecture Overview

- `client/src/pages`: Role-specific screens for employee, manager, and admin workflows.
- `client/src/components`: Shared UI pieces for attendance tables, punch forms, camera capture, location picker, overtime requests, and navigation.
- `client/src/hooks`: Reusable attendance selection and Excel export logic.
- `client/src/features`: Redux Toolkit auth state and RTK Query API endpoints.
- `client/src/utils`: Attendance formatting and Excel workbook helpers.
- `server/models`: Mongoose schemas for users, attendance records, and overtime requests.
- `server/controllers`: Request handling and business rules for auth, attendance, overtime, reports, and admin actions.
- `server/routes`: Express route modules for `/api/auth`, `/api/attendance`, `/api/overtime`, `/api/reports`, and `/api/admin`.
- `server/middleware`: JWT authentication and role authorization middleware.
- `server/utils`: Working-hours and overtime calculation helpers.
- `server/config`: MongoDB connection and logger configuration.

## Features Implemented

- JWT registration and login.
- Role-based dashboards for employee, manager, and admin.
- Role-based navbar links for admin and manager sections.
- Employee punch-in with selfie, location, punch-in date, and punch-in time.
- Employee punch-out with selfie, location, punch-out date, and punch-out time.
- Validation that punch-out date/time cannot be earlier than punch-in date/time.
- Multiple punch-in and punch-out sessions per user per day.
- Accordion attendance table grouped by day.
- Working-hours calculation across daily attendance sessions.
- Standard shift completion tracking based on an 8 hour normal shift.
- Overtime eligibility after normal shift hours are exceeded.
- Overtime request flow for employees and managers only.
- Admin users are blocked from requesting overtime.
- One active overtime request at a time until it is approved or rejected.
- Approved overtime prevents duplicate overtime requests for the same attendance record.
- Manager/admin review flow for pending overtime requests.
- Standard shift validation before overtime approval or rejection.
- Attendance overtime status updates after request review.
- Manager team attendance view and team user attendance drill-down.
- Admin system attendance view.
- Admin user management view with user attendance drill-down.
- Admin assign-manager workflow.
- Pending overtime request tables for manager/admin review.
- Attendance filters by user, date, and status where applicable.
- Excel export for user attendance, manager team attendance, and system attendance using the `xlsx` library.
- Daily report API for attendance reporting.

## API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/attendance/punch-in`
- `POST /api/attendance/punch-out`
- `GET /api/attendance/me`
- `GET /api/attendance/team`
- `PUT /api/attendance/:id/validate`
- `POST /api/overtime/request`
- `GET /api/overtime/mine`
- `GET /api/overtime/pending`
- `PUT /api/overtime/:id`
- `GET /api/reports/daily`
- `GET /api/admin/users`
- `GET /api/admin/attendance`
- `PUT /api/admin/assign-manager`

## Assumptions Made

- A normal work shift is 8 hours.
- Overtime is calculated only after the normal 8 hour shift is completed.
- Employees and managers can request overtime, but admins cannot.
- Managers can review attendance and overtime for users assigned to them.
- Admins can view system-wide users, attendance, and overtime requests.
- Overtime review should happen after standard shift approval/validation.
- Selfies are stored as image data in MongoDB for this implementation; production systems should use object storage.
- Browser geolocation and camera permissions are required for accurate punch records.
- Excel export is performed on the client from the data already loaded in the table/view.
