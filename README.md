# HealthScan --- Healthcare Appointment Management System

## Basic Steps to Run the Website

### 1. Open the Website

Visit the deployed HealthScan application:

https://healthscan-frontend.vercel.app/

### 2. Administrator Login

To access the administrator dashboard:

- **Email:** `admin@healthscan.ai`
- **Password:** `Admin123`

Navigate to the **Admin Sign In** page and enter the above credentials.

### 3. Explore the Application

After logging in, you can explore the available HealthScan features based on
the assigned user role, including:

- Patient management
- Doctor management
- Appointment management
- Doctor working hours
- Doctor leave management
- Appointment booking and cancellation

### 4. Patient Registration

New patients can create an account using the **Patient Registration** option
and then log in to access patient features.

### 5. Doctor Access

Doctor accounts can be used to manage:

- Professional profile
- Working hours
- Leave requests
- Appointment-related functionality

> **Note:** The deployed application requires an active internet connection
> to communicate with the hosted frontend and backend services.



## 1. Project Overview

**HealthScan** is a web-based Healthcare Appointment Management System
designed to manage interactions between **Patients, Doctors, and
Administrators**.

The system provides a centralized platform where:

-   **Patients** can view active doctors, select a date, view available
    appointment slots, book appointments, and manage their appointments.
-   **Doctors** can manage their professional profile, working hours,
    and leave requests.
-   **Administrators** can manage doctors, patients, appointments, and
    doctor leave requests.

The application uses authentication and role-based authorization so that
each user can access functionality appropriate to their role.

------------------------------------------------------------------------

## 2. Main Objectives

1.  Digitize the healthcare appointment-booking process.
2.  Allow patients to find active doctors and book appointments.
3.  Generate appointment slots dynamically from doctor working hours.
4.  Prevent booking of already occupied slots.
5.  Allow doctors to manage availability and leave information.
6.  Provide administrators with centralized management functionality.
7.  Enforce authentication, authorization, and backend validation.

------------------------------------------------------------------------

## 3. User Roles

### Patient

Patients can:

-   Register and log in.
-   View/update their profile.
-   View active doctors.
-   Search doctors by name or specialization.
-   Select a doctor and appointment date.
-   View available/booked slots.
-   Book an appointment.
-   View appointments.
-   Cancel appointments.

### Doctor

Doctors can:

-   Log in securely.
-   View/update their professional profile.
-   Configure working hours.
-   Create and manage leave requests.
-   Access appointment-related functionality implemented for their role.

### Administrator

Administrators can:

-   View dashboard statistics.
-   Create and manage doctors.
-   Activate/deactivate doctors.
-   Manage patients.
-   Manage appointments.
-   Manage doctor leave requests.
-   Approve or reject leave requests.

------------------------------------------------------------------------

## 4. Appointment Booking Workflow

The booking engine uses **dynamic slot generation**.

``` text
Doctor Working Hours
        +
Slot Duration
        +
Existing Appointments
        ↓
Backend generates slots
        ↓
Patient selects available slot
        ↓
Appointment is booked
```

For example, if a doctor works from **09:00 to 13:00** and has a
**30-minute slot duration**, the backend generates:

``` text
09:00 - 09:30
09:30 - 10:00
10:00 - 10:30
10:30 - 11:00
11:00 - 11:30
11:30 - 12:00
12:00 - 12:30
12:30 - 13:00
```

Already scheduled appointments are marked unavailable.

**Important:** individual slots do not need to be manually created in
the database. The backend generates them from working hours and the
doctor's configured slot duration.

------------------------------------------------------------------------

## 5. System Architecture

``` text
Patient / Doctor / Admin
          │
          ▼
┌─────────────────────────┐
│ React Frontend          │
│ Tailwind CSS            │
│ React Router             │
└────────────┬────────────┘
             │ REST API
             ▼
┌─────────────────────────┐
│ FastAPI Backend         │
│ Authentication          │
│ Authorization           │
│ Business Logic          │
│ Validation              │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ SQLAlchemy + Database   │
└─────────────────────────┘
```

### Frontend

-   React
-   React Router
-   Tailwind CSS
-   JavaScript
-   Fetch API

### Backend

-   Python
-   FastAPI
-   SQLAlchemy
-   Pydantic
-   JWT Bearer Authentication
-   Role-based authorization

------------------------------------------------------------------------

## 6. Project Structure

``` text
HealthScan/
│
├── backend/
│   └── app/
│       ├── api/
│       ├── core/
│       ├── models/
│       ├── schemas/
│       └── ...
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── ...
│
├── README.md
└── ...
```

The backend separates:

-   **Models** --- database entities
-   **Schemas** --- request/response validation
-   **API routers** --- REST endpoints
-   **Core** --- database, security, and shared configuration

The frontend separates pages, reusable components, and API services.

------------------------------------------------------------------------

## 7. Major Modules

### Authentication

The system supports:

``` text
POST /auth/register
POST /auth/login
GET  /auth/me
PUT  /auth/change-password
```

Protected requests use:

``` http
Authorization: Bearer <access_token>
```

### Doctor Management

Administrators can create, view, update, activate, and deactivate
doctors.

### Doctor Working Hours

Doctors can configure:

``` text
day_of_week
start_time
end_time
```

Days are represented as:

``` text
Monday = 0
Tuesday = 1
Wednesday = 2
Thursday = 3
Friday = 4
Saturday = 5
Sunday = 6
```

The backend validates that the start time is before the end time.

### Doctor Leave Management

Doctors can submit leave requests. Administrators can manage and
approve/reject them.

Supported statuses:

``` text
PENDING
APPROVED
REJECTED
```

### Patient Management

Patients can manage their profile and appointments. Administrators can
manage patient records and active status.

### Appointment Management

An appointment contains:

``` text
Patient
Doctor
Date
Start Time
End Time
Status
```

The backend validates the appointment request and checks existing
scheduled appointments.

------------------------------------------------------------------------

## 8. Important APIs

### System

``` text
GET /health
```

### Patient

``` text
GET  /patients/me
POST /patients/me
PUT  /patients/me

GET  /appointments/me
POST /appointments/me
DELETE /appointments/me/{appointment_id}
```

### Public Doctor APIs for Patients

``` text
GET /doctors/public
GET /doctors/public/{doctor_id}/slots?date=YYYY-MM-DD
```

### Doctor Profile

``` text
GET  /doctors/me
POST /doctors/me
PUT  /doctors/me
```

### Doctor Working Hours

``` text
GET    /doctors/me/working-hours
POST   /doctors/me/working-hours
PUT    /doctors/me/working-hours/{day_of_week}
DELETE /doctors/me/working-hours/{day_of_week}
```

### Doctor Leaves

``` text
GET  /doctors/me/leaves
POST /doctors/me/leaves
PUT  /doctors/me/leaves/{leave_id}
```

Administrative APIs cover dashboard statistics, doctors, patients,
appointments, and doctor leaves.

------------------------------------------------------------------------

## 9. Installation and Setup

### Prerequisites

Install:

-   Python 3.x
-   Node.js and npm
-   A relational database configured for the project
-   Git

### Clone the repository

``` bash
git clone https://github.com/Akshat-WorkHub/HealthScan.git
cd HealthScan
```

### Backend

``` bash
cd backend

python -m venv venv
```

Windows:

``` bash
venv\Scripts\activate
```

macOS/Linux:

``` bash
source venv/bin/activate
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

Configure the backend environment variables required by the project,
including the database connection and application secret.

Start the FastAPI server:

``` bash
uvicorn app.main:app --reload
```

Backend:

``` text
http://localhost:8000
```

API documentation:

``` text
http://localhost:8000/docs
```

### Frontend

Open another terminal:

``` bash
cd frontend
npm install
npm run dev
```

Open the URL displayed by Vite, normally:

``` text
http://localhost:5173
```

The frontend communicates with the backend at:

``` text
http://localhost:8000
```

------------------------------------------------------------------------

## 10. Reviewer / Panelist Demonstration Guide

### A. Administrator

Log in as an administrator and demonstrate:

1.  Dashboard statistics.
2.  Doctor management.
3.  Patient management.
4.  Appointment management.
5.  Doctor leave management.
6.  Leave approval/rejection.
7.  Doctor activation/deactivation.

### B. Doctor

Log in as a doctor and demonstrate:

1.  Doctor profile.
2.  Working-hours configuration.
3.  Leave request creation.
4.  Appointment-related functionality.

For the booking demonstration, configure working hours for at least one
future/current working day.

### C. Patient

Log in as a patient and demonstrate:

1.  Patient dashboard.
2.  Book Appointment.
3.  Search for an active doctor.
4.  Select a doctor.
5.  Select a date.
6.  View dynamically generated slots.
7.  Select an available slot.
8.  Review appointment summary.
9.  Confirm appointment.
10. View the booking confirmation.
11. View/cancel the appointment.

------------------------------------------------------------------------

## 11. Recommended Booking Demonstration

Configure a doctor with:

``` text
Working Day: Monday
Working Hours: 09:00 AM - 01:00 PM
Slot Duration: 30 minutes
```

Then use a patient account to select that Monday.

The system should generate:

``` text
09:00 AM
09:30 AM
10:00 AM
10:30 AM
11:00 AM
11:30 AM
12:00 PM
12:30 PM
```

Book one slot and request the slots again. The booked slot should become
unavailable while the remaining slots stay available.

------------------------------------------------------------------------

## 12. Security and Authorization

The backend implements role-based authorization:

``` text
PATIENT → Patient functionality
DOCTOR  → Doctor functionality
ADMIN   → Administration functionality
```

Protected APIs require an authenticated bearer token.

Authorization is enforced on the backend, so protected functionality
cannot be accessed simply by manipulating frontend routes.

------------------------------------------------------------------------

## 13. Validation and Business Rules

The system includes validation for important business rules:

-   Invalid date formats are rejected.
-   Past appointment dates are rejected.
-   Inactive doctors cannot be booked.
-   Working hours require a valid start/end range.
-   Duplicate working hours for the same doctor/day are rejected.
-   Existing scheduled appointments are excluded from availability.
-   Protected endpoints require authentication and the appropriate role.

------------------------------------------------------------------------

## 14. Troubleshooting

### Backend is not reachable

Check:

``` text
http://localhost:8000/health
```

If it does not respond, start the FastAPI backend.

### No doctors appear

Check that:

-   The doctor exists.
-   The doctor's account is active.
-   The patient is logged in.

### No slots appear

Check that:

1.  The doctor has working hours for the selected weekday.
2.  The selected date is not in the past.
3.  The doctor has a valid slot duration.
4.  The backend is running.
5.  The browser network tab does not show an API error.

### A slot is marked Booked

The backend found an existing scheduled appointment for that doctor,
date, and start time.

------------------------------------------------------------------------

## 15. Technology Stack

  Layer            Technology
  ---------------- ---------------------------
  Frontend         React
  Styling          Tailwind CSS
  Routing          React Router
  Backend          FastAPI
  Language         Python
  ORM              SQLAlchemy
  Validation       Pydantic
  Authentication   JWT Bearer Authentication
  API              REST
  Database         Relational database

------------------------------------------------------------------------

## 16. Key Design Decisions

### Dynamic Slot Generation

Slots are generated from doctor working hours and slot duration instead
of storing every possible slot as an individual database record.

### Role-Based Access Control

Patient, Doctor, and Administrator functionality is separated at the API
level.

### Backend-Centric Validation

Important business rules are enforced on the backend rather than relying
only on frontend validation.

### Separate Frontend and Backend

The frontend handles presentation and user interaction, while the
backend handles business logic, authorization, validation, and database
operations.

------------------------------------------------------------------------

## 17. Project Status

The core appointment-management workflow includes:

-   Authentication and authorization
-   Patient management
-   Doctor management
-   Doctor working hours
-   Doctor leave management
-   Appointment management
-   Dynamic appointment slot generation
-   Patient appointment booking
-   Appointment cancellation
-   Administrative management

Further UI refinement, automated testing, deployment, and additional
modules can be added as the project evolves.

------------------------------------------------------------------------

## 18. Conclusion

**HealthScan** provides an integrated healthcare appointment-management
platform for Patients, Doctors, and Administrators.

Its core scheduling engine combines:

**Doctor Availability + Working Hours + Slot Duration + Existing
Appointments**

to dynamically determine available appointment slots.

The project demonstrates the integration of:

**React + Tailwind CSS + FastAPI + SQLAlchemy + REST APIs + JWT
Authentication + Role-Based Authorization**

into a complete healthcare appointment-management application.
