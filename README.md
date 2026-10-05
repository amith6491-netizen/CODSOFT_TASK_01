# EduManage — Higher Education Campus ERP & Student Management System

EduManage is a modern, full-stack Academic & Student Management Platform designed for colleges and universities. It offers role-based portals for **Students**, **Faculty Members**, and **Administrators**, providing end-to-end management for **Undergraduate (UG)** and **Postgraduate (PG)** degree courses, year-wise curriculum tracking, continuous assessment marks entry, real-time transcripts, attendance monitoring, and fee records.

---

## 🚀 Key Features

### 🎓 1. Undergraduate (UG) & Postgraduate (PG) Degree System
- Configured with official degree programs across multiple academic disciplines and years:
  - **UG Programs**: B.Tech CSE (Years 1–4), B.Tech ECE (Years 1–4), BCA (Years 1–3), B.Sc Computer Science (Year 1), B.Com (Year 1), BBA (Year 1).
  - **PG Programs**: MCA (Years 1–2), MBA (Years 1–2), M.Tech CSE (Years 1–2), M.Sc Data Science (Year 1).
- Integrated with [`src/lib/curriculum.ts`](./src/lib/curriculum.ts), mapping out official year-wise curricula and subjects.

### 📝 2. Faculty Marks Entry & Assessment Management
- **Smart Subject Dropdown**: Selecting a degree course automatically loads the official curriculum subjects for that specific program and year.
- **Continuous Assessment Creation**: Record scores for mid-term tests, semester finals, quizzes, and practical assessments with customizable Maximum Marks.
- **Dynamic Student Rosters**: Live score entry with auto-calculated percentage, color-coded merit badges (Green $\ge 75\%$, Amber $\ge 40\%$, Red $< 40\%$), and teacher remarks.
- **Custom / Elective Support**: Option to type any custom elective or special topic.
- **Assessment History**: Interactive history view displaying class averages, highest scores, and complete student mark breakdowns.

### 👨‍🎓 3. Student Academic Portal
- **Universal Sign-In**: Students can log in directly using their **Student Admission Number** (e.g., `S-2026-001`, `S-2026-005`) or registered email.
- **Live Academic Transcript**: Real-time view of all published exam scores, subjects, dates, percentage badges, and faculty remarks.
- **Attendance & Fee Visibility**: Track class attendance percentages and outstanding tuition fee invoices.

### 🛡️ 4. Administration & Account Provisioning
- **Single & Bulk Student Enrollment**: Add students individually or provision batches with auto-suggested sequential admission numbers (`S-2026-xxx`), degree course assignment, and guardian details.
- **Faculty Onboarding**: Register teaching staff with sequential Employee IDs (`T-100x`) and subject specializations.
- **Degree Course Management**: Create new UG and PG degree sections, track student enrollments, and inspect official syllabus subjects via the `📚 Subjects` curriculum viewer.

### 🔐 5. Modern Authentication & Security
- **Multi-Identifier Login**: Accepts Institutional Email, Student Admission Number, or Faculty Employee ID (case-insensitive).
- **Security**: Passwords hashed with bcrypt; sessions secured with HTTP-only JWT cookies.
- **Real Database-Driven Interface**: The landing page and login portal reflect 100% live PostgreSQL database metrics with zero hardcoded placeholders.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers, TypeScript)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Hosted on [Neon](https://neon.tech/))
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT in HTTP-Only Cookies with `bcryptjs` password hashing
- **Styling**: Vanilla CSS with modern Glassmorphic design tokens and Google Fonts (*Plus Jakarta Sans* & *Outfit*)

---

## 📚 Official Degree Programs & Curriculum Catalog

The system includes a master curriculum mapping ([`src/lib/curriculum.ts`](./src/lib/curriculum.ts)):

| Level | Program | Duration | Key Subjects Included |
| :--- | :--- | :---: | :--- |
| **UG** | **B.Tech CSE** | 4 Years | Engg Math, Physics, Chemistry, C/Python, Data Structures, OOP, DBMS, OS, Networks, DAA, AI, ML, Cloud Computing, Cyber Security, Distributed Systems |
| **UG** | **B.Tech ECE** | 4 Years | Engg Math, Circuits, Digital Electronics, Signals & Systems, Analog Electronics, Microprocessors, DSP, VLSI, Wireless & Optical Comm, IoT |
| **UG** | **BCA** | 3 Years | Computer Fundamentals, C, Web Tech, Data Structures, OOP, DBMS, Java, Python, Cloud Computing, Cyber Security, Mobile App Dev |
| **UG** | **B.Sc Computer Science**| 1 Year | Programming in C, Computer Fundamentals, Mathematics, Digital Logic, Data Structures, Communication Skills, Computer Organization |
| **UG** | **B.Com** | 1 Year | Financial Accounting, Business Economics, Business Org & Management, Business Communication, Business Mathematics, Principles of Marketing |
| **UG** | **BBA** | 1 Year | Principles of Management, Business Economics, Financial Accounting, Business Communication, Organizational Behaviour, Marketing Management |
| **PG** | **MCA** | 2 Years | Advanced Programming, DSA, Advanced DBMS, OS, Computer Networks, Software Engineering, AI, ML, Cloud Computing, Cyber Security, Big Data |
| **PG** | **MBA** | 2 Years | Principles of Management, Organizational Behaviour, Managerial Economics, Financial Mgmt, Marketing, HRM, Strategic Mgmt, Business Analytics |
| **PG** | **M.Tech CSE** | 2 Years | Advanced DSA, Advanced Algorithms, Advanced OS, Advanced Networks, Distributed Systems, ML, AI, Cloud Computing, Research Methodology |
| **PG** | **M.Sc Data Science** | 1 Year | Probability & Statistics, Python for Data Science, DSA, DBMS, Data Visualization, Machine Learning, Statistical Computing, Big Data, AI, Data Mining |

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js** (v18.17.0 or higher recommended)
- **PostgreSQL** instance (local or hosted on Neon / Supabase)
- **npm** or **yarn** / **pnpm**

### 2. Installation
Clone the repository and install project dependencies:

```bash
git clone https://github.com/amith6491-netizen/CODSOFT_TASK_01.git
cd CODSOFT_TASK_01
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:

```env
# Database connection (Neon / PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-sample-pooler.region.aws.neon.tech/edumanage?sslmode=require"

# JWT Secret for signing session cookies
JWT_SECRET="super-secret-jwt-key-change-this-in-production"

# Application environment
NODE_ENV="development"
```

### 4. Database Setup & Seeding
Run Prisma migrations to create the schema and seed standard degree courses and accounts:

```bash
# Push schema migrations
npx prisma migrate dev --name init

# Seed degree courses, faculty, and student accounts
npm run seed
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Seeded Credentials

All accounts are created with password: `password123`

| Role | Sign-in Identifier | Default Email | Dashboard Route |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@edumanage.com` | `admin@edumanage.com` | `/dashboard/admin` |
| **Faculty Member** | `T-1001` or `teacher@edumanage.com` | `teacher@edumanage.com` | `/dashboard/teacher` |
| **Student** | `S-2026-001` or `student@edumanage.com` | `student@edumanage.com` | `/dashboard/student` |
| **Student** | `S-2026-005` or `student5@edumanage.com`| `student5@edumanage.com` | `/dashboard/student` |

---

## 🚀 Production Deployment Setup

You can deploy EduManage to any major hosting platform. Below are step-by-step instructions for the most popular deployment environments.

### Option A: Deploying to Vercel (Recommended)

[Vercel](https://vercel.com/) is the native platform for Next.js and provides zero-config deployments with automated edge routing and SSL.

1. **Push your repository** to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your `CODSOFT_TASK_01` repository.
4. **Configure Environment Variables** in the Vercel project settings:
   - `DATABASE_URL`: Your production PostgreSQL connection string (use a pooled Neon URL for serverless compatibility, e.g., `postgres://...?sslmode=require`).
   - `JWT_SECRET`: A secure, random 32+ character string (generate with `openssl rand -base64 32`).
   - `NODE_ENV`: `production`
5. **Build and Output Settings**:
   - The build script in `package.json` automatically runs `prisma generate && next build`.
   - Vercel automatically detects Next.js settings.
6. Click **Deploy**. Vercel will build the application, generate the Prisma Client, and provision a live HTTPS URL.
7. **Apply Migrations to Production DB**:
   Run database migrations from your local machine pointing to the production database:
   ```bash
   npx prisma migrate deploy
   ```

---

### Option B: Deploying to Render or Railway

#### Render
1. Create a **New Web Service** and link your Git repository.
2. Set Environment to **Node**.
3. Configure commands:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. In **Environment Variables**, add:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: Your production secret key.
   - `NODE_ENV`: `production`
5. Click **Create Web Service**.

#### Railway
1. Click **"New Project"** → **"Deploy from GitHub repo"**.
2. Add a PostgreSQL database service directly in Railway (or use your existing Neon database).
3. Set the environment variables (`DATABASE_URL`, `JWT_SECRET`).
4. Railway will automatically execute `npm run build` and launch the app using `npm run start`.

---

### Option C: Self-Hosted Linux Server (Ubuntu / Debian + PM2 + Nginx)

For deployment on a dedicated VPS (DigitalOcean Droplet, AWS EC2, Linode, or Hetzner):

#### 1. Server Prerequisites
Connect to your VPS via SSH and install Node.js and PM2:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Install PM2 process manager globally
sudo npm install -g pm2
```

#### 2. Clone & Build the Application
```bash
# Clone to web root
cd /var/www
sudo git clone https://github.com/amith6491-netizen/CODSOFT_TASK_01.git edumanage
cd edumanage

# Install dependencies and build
npm install
cp .env.example .env
nano .env   # Enter production DATABASE_URL and JWT_SECRET

# Run database migrations and build
npm run prisma:deploy
npm run build
```

#### 3. Start Application with PM2
```bash
# Start Next.js production server
pm2 start npm --name "edumanage" -- start

# Configure PM2 to restart on server reboot
pm2 startup
pm2 save
```

#### 4. Configure Nginx Reverse Proxy
Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/edumanage
```

Paste the following block (replace `yourdomain.com` with your domain or server IP):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/edumanage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Secure with Free HTTPS (Let's Encrypt / Certbot)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### Option D: Docker & Container Deployment

You can containerize and run EduManage with Docker:

#### 1. Multi-Stage `Dockerfile`
Create a `Dockerfile` in the root:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
```

#### 2. Run with Docker Compose
Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/edumanage?schema=public
      - JWT_SECRET=production_jwt_secret_change_me
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: edumanage
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
```

Build and launch the stack:

```bash
docker-compose up -d --build
```

---

## 🔒 Production Security Checklist

- [x] **Secure Cookies**: In production (`NODE_ENV=production`), session cookies are set with `Secure` and `HttpOnly; SameSite=Lax`.
- [x] **Strong Secret Key**: Never commit your `JWT_SECRET` to version control. Generate a random cryptographic string.
- [x] **Connection Pooling**: When deploying serverless (e.g. Vercel), ensure your PostgreSQL URI uses connection pooling (e.g., Neon's `-pooler` connection string) to prevent exhausting database connections.
- [x] **Role Middleware Protection**: Client and API routes verify JWT claims on the server and immediately redirect unauthenticated or mismatched-role users.

---

## 📡 REST API Overview

| Route | Method | Access | Purpose |
| :--- | :---: | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates via Email, Admission No, or Faculty ID; issues JWT cookie |
| `/api/auth/logout` | `POST` | Any Authenticated | Clears the session cookie |
| `/api/auth/register` | `POST` | Admin | Creates single or batch student/faculty accounts |
| `/api/classes` | `GET`, `POST` | Admin, Faculty | Lists all degree courses or creates a new UG/PG course |
| `/api/students` | `GET` | Admin, Faculty | Retrieves enrolled students with course and academic records |
| `/api/students/:id` | `GET`, `PATCH`, `DELETE`| Admin, Faculty, Self | Detailed student profile, record updates, or removal |
| `/api/teachers` | `GET` | Admin | Lists faculty members with subject specializations |
| `/api/exams` | `GET`, `POST` | Faculty, Authenticated | Creates a new assessment/exam for a degree course |
| `/api/exams/grades` | `GET`, `POST` | Faculty, Authenticated | Batch records marks, percentages, and faculty remarks |
| `/api/attendance` | `GET`, `POST` | Faculty, Authenticated | Records or retrieves daily student attendance |
| `/api/fees` | `GET`, `POST`, `PATCH` | Admin, Authenticated | Manages tuition invoices and payment records |

---

## 📂 Project Directory Structure

```
CODSOFT_TASK_01/
├── prisma/
│   ├── schema.prisma          # Database schema (User, Student, Teacher, ClassSection, Exam, Grade, Fee)
│   └── seed.ts                # Seeding script for degree courses, faculty, and students
├── src/
│   ├── app/
│   │   ├── api/               # Next.js Server REST API endpoints
│   │   ├── dashboard/         # Role-based dashboard views
│   │   │   ├── admin/         # Administrator analytics, enrollment & course management
│   │   │   ├── faculty/       # Class rosters, dynamic marks entry & attendance
│   │   │   └── student/       # Live academic transcript, attendance & fees
│   │   ├── login/             # Dual-column glassmorphic authentication page
│   │   ├── globals.css        # Global CSS design tokens and responsive classes
│   │   └── page.tsx           # Home landing page with live database statistics
│   ├── components/            # Reusable UI components
│   │   ├── AccountManager.tsx # Admin student enrollment, faculty onboarding & course manager
│   │   ├── MarksEntryForm.tsx # Faculty assessment creator and marks entry roster
│   │   ├── LoginForm.tsx      # Interactive client authentication form with role tabs
│   │   └── AttendanceForm.tsx # Rapid daily attendance marker
│   ├── lib/
│   │   ├── auth.ts            # JWT signing, verification, and cookie helpers
│   │   ├── curriculum.ts      # Master degree catalog and year-wise subjects
│   │   └── prisma.ts          # Singleton PrismaClient connection
│   └── proxy.ts               # Next.js route protection & role redirection
├── package.json               # Scripts, dependencies, and build commands
├── next.config.js             # Next.js configuration
└── tsconfig.json              # TypeScript configuration
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
