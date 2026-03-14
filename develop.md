# School Connect App

A simple school communication platform that connects **teachers, parents, and school administration** in one system.

The platform includes:

* 📱 **Mobile App (React Native)** – used by Teachers and Parents
* 💻 **Admin Dashboard (Next.js)** – used by School Administration
* 🔔 **Real-time notifications** for attendance, homework, announcements, and fee reminders

The goal is to **reduce the communication gap between schools and parents**.

---

# Core Concept

Instead of maintaining separate apps, we use **one mobile app with role-based login**.

Users log in as:

* **Teacher**
* **Parent**

Accounts are created **only by school administration**.
Users cannot sign up themselves.

This ensures:

* controlled access
* verified parent accounts
* easier school onboarding

---

# Features

## Teacher Features

* Mark student attendance
* Upload homework
* Post announcements
* Add exam marks
* Send class notifications

Example workflow:

Teacher marks attendance → Parent receives notification.

---

## Parent Features

* View student attendance
* View homework updates
* Receive announcements
* Get fee reminders
* View exam results
* Request leave for student

---

## Admin Dashboard Features

* Create teacher accounts
* Create parent accounts
* Manage students
* Manage classes
* Track fee payments
* Send school-wide announcements
* View reports

---

# Tech Stack

## Mobile App

* React Native
* Expo

## Admin Dashboard

* Next.js
* TailwindCSS

## Backend

* Next.js API Routes / Node.js

## Database

* MongoDB

## Queue (future scaling)

* Redis

## Notifications

* Firebase Cloud Messaging (FCM)

---

# Authentication Model

Users **cannot sign up**.

Only admin can create users.

Authentication flow:

Admin creates user →
User receives login credentials →
User logs into mobile app.

User roles:

* parent
* teacher
* admin

---

# Project Structure (High Level)

```
school-connect/

mobile-app/
    screens/
    components/
    services/
    navigation/

admin-dashboard/
    pages/
    components/
    services/

backend/
    api/
    controllers/
    models/
    services/
```

---

# Example Database Models

### User

```
{
  name: String,
  role: "teacher" | "parent" | "admin",
  phone: String,
  password: String,
  schoolId: String
}
```

---

### Student

```
{
  name: String,
  class: String,
  section: String,
  parentId: String,
  schoolId: String
}
```

---

### Attendance

```
{
  studentId: String,
  date: Date,
  status: "present" | "absent"
}
```

---

### Homework

```
{
  classId: String,
  teacherId: String,
  description: String,
  dueDate: Date
}
```

---

# Future Features

* Fee payment integration
* Bus tracking
* Parent-teacher chat
* AI attendance reports
* Exam analytics
* Multi-school support

---

# MVP Goal

The first version will focus only on:

1. Admin creates users
2. Teacher marks attendance
3. Parent receives attendance updates
4. Teacher uploads homework
5. Parent receives notifications

---

# Long Term Vision

Build a **complete School Operating System** for small and medium schools that replaces:

* paper attendance
* WhatsApp communication
* manual fee reminders
* notebook homework tracking

---

# License

Private project – not open source.
