# EduManage

A full-stack student management system for schools — student, teacher, and admin
dashboards covering attendance, examinations, fees, and academic records.

## Tech stack

- **Frontend / API:** Next.js 14 (App Router, TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT stored in an HTTP-only cookie, with password hashing via bcrypt

## Features

- Role-based dashboards for **Admin**, **Teacher**, and **Student**, protected by
  middleware that redirects unauthenticated or mismatched-role requests.
- **Admin:** school-wide stats, student roster, account creation, fee management.
- **Teacher:** class rosters, quick attendance marking, exam creation and grading.
- **Student:** personal attendance history, exam results, and fee status.
- REST API for students, teachers, attendance, exams, grades, and fees, all with
  role checks on the server.

## Data model

`User` (role: ADMIN / TEACHER / STUDENT) → optional `Teacher` or `Student` profile.
`Student` belongs to a `ClassSection`, which has one `Teacher`. `Attendance`,
`Grade` (via `Exam`), and `Fee` all hang off `Student`. See `prisma/schema.prisma`
for the full schema.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and fill in a real Postgres connection string and
   a random `JWT_SECRET`:

   ```bash
   cp .env.example .env
   ```

3. **Set up the database**

   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

   The seed script creates three demo accounts, all with password `password123`:

   | Role    | Email                  |
   |---------|-------------------------|
   | Admin   | admin@edumanage.com    |
   | Teacher | teacher@edumanage.com  |
   | Student | student@edumanage.com  |

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` and sign in with one of the demo accounts.

## API overview

| Route                          | Method | Access          | Purpose                          |
|---------------------------------|--------|-----------------|-----------------------------------|
| `/api/auth/login`               | POST   | Public          | Sign in, sets auth cookie         |
| `/api/auth/logout`              | POST   | Any signed-in   | Clears auth cookie                |
| `/api/auth/register`            | POST   | Admin           | Create a user (admin/teacher/student) |
| `/api/students`                 | GET    | Admin, Teacher  | List students                     |
| `/api/students/:id`             | GET    | Owner, Admin, Teacher | Student detail with records |
| `/api/students/:id`             | PATCH/DELETE | Admin     | Update or remove a student        |
| `/api/teachers`                 | GET    | Admin           | List teachers                     |
| `/api/attendance`                | POST/GET | Teacher (post), owner/staff (get) | Mark/view attendance |
| `/api/exams`                     | POST/GET | Teacher (post), any signed-in (get) | Create/view exams |
| `/api/exams/grades`              | POST/GET | Teacher (post), owner/staff (get) | Record/view grades |
| `/api/fees`                      | POST/GET/PATCH | Admin (post/patch), owner/staff (get) | Manage fees |

## Project structure

```
prisma/
  schema.prisma       Data model
  seed.ts              Demo data
src/
  app/
    api/               REST API route handlers
    dashboard/          Role-based dashboard pages
    login/              Sign-in page
  components/          Shared UI (dashboard shell, attendance form)
  lib/                  Prisma client, auth helpers
  middleware.ts         Role-based route protection
```

## Notes / next steps

- Account creation is currently API-only (`POST /api/auth/register`); an admin UI
  screen for adding students, teachers, and classes would be a natural next step.
- Passwords are hashed with bcrypt; rotate `JWT_SECRET` and use HTTPS in production
  so the auth cookie is only ever sent over a secure connection.
