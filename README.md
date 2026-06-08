# EAP - Smart Project & Task Collaboration System

EAP is a full-stack project management and collaboration tool. It provides role-based access control, task status workflows, team collaboration features, and real-time activity tracking to help teams manage their workload.

**Live:** [eap-red.vercel.app](https://eap-red.vercel.app) &nbsp;|&nbsp; **API:** [eap-production.up.railway.app](https://eap-production.up.railway.app) &nbsp;|&nbsp; **Source:** [github.com/thekawsarhossain/EAP-4.0](https://github.com/thekawsarhossain/EAP-4.0)

---

## Key Features

### Authentication & Authorization

- **Secure Authentication**: Sign up and login using email and password, powered by NextAuth.js.
- **Demo Mode**: Quick login button on the sign-in page to pre-fill credentials for testing.
- **Role-Based Access Control**:
  - **Admin**: Full system access, including all projects and configuration.
  - **Project Manager**: Create and manage projects, assign tasks, and add members.
  - **Team Member**: View assigned projects/tasks and update status/progress of own tasks.

### Project & Task Management

- **Project Workspaces**: Create, update, and delete projects. Track deadlines and status (Active, Completed, On Hold).
- **Kanban Task Board**: Visual workflow management (Todo, In Progress, Completed).
- **Task Validation & Conflict Prevention**:
  - Prevents duplicate task titles within the same project.
  - Prevents assigning tasks that are already marked as Completed.
  - Restricts deadlines to future dates.
- **Rich Task Details**: Attach files (via Cloudinary), write comments, and update status.

### Collaboration & Tracking

- **Team Workloads**: View member workloads showing total tasks, completed tasks, and pending counts.
- **Activity Log**: Real-time log of recent changes (e.g., project creations, status updates, assignments) showing the last 5 to 10 events.
- **Notifications**: Bell icon with unread indicator and controls to mark notifications as read.

### Search, Filters & Productivity

- **Global Search**: Search projects by name, tasks by title or description, and members by name.
- **Granular Filters**: Filter lists by status, priority, assignee, and deadline status (Upcoming this week, Overdue).
- **Sorting**: Sort by creation date, deadline, priority, or last updated time.
- **Additional UI Perks**: Dark/light mode support, responsive layouts with mobile drawer navigation, and skeleton load states.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Redux Toolkit, RTK Query, NextAuth.js v5, Tailwind CSS, Shadcn UI, Recharts.
- **Backend**: NestJS 11, Prisma ORM, PostgreSQL (Neon).
- **Storage & Services**: Cloudinary for file attachments.
- **Deployment**: Vercel (Frontend), Railway (Backend).

---

## Project Structure

```text
eap/
├── apps/
│   ├── api/          # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/    # Auth, users, projects, tasks, comments, attachments, activity, notifications
│   │   │   ├── common/     # Guards, decorators, filters, interceptors
│   │   │   └── prisma/     # PrismaService
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── seed.ts
│   └── web/          # Next.js frontend
│       ├── app/
│       │   ├── (auth)/     # Login, signup
│       │   └── (dashboard)/dashboard/  # Dashboard and secondary pages
│       ├── components/
│       ├── store/          # RTK slices and API endpoints
│       ├── lib/            # Auth config, utils, schema validations, toast helper
│       └── types/
└── README.md
```

---

## Environment Variables

### Backend (`apps/api/.env`)

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
AUTH_SECRET="your-nextauth-secret"
AUTH_URL="http://localhost:3000"
```

---

## Demo Credentials

| Role                    | Email         | Password   |
| :---------------------- | :------------ | :--------- |
| Admin                   | admin@eap.dev | demo123456 |
| Project Manager         | pm@eap.dev    | demo123456 |
| Developer (Team Member) | john@eap.dev  | demo123456 |
| Designer (Team Member)  | sara@eap.dev  | demo123456 |

> You can also click the **"Use demo account"** button on the login screen to automatically log in as Admin.

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database
- Cloudinary account

### 1. Install Dependencies

```bash
git clone https://github.com/thekawsarhossain/EAP-4.0.git
cd EAP-4.0
pnpm install
```

### 2. Configure Environment Variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Open both environment files and fill in your database, nextauth, and Cloudinary keys.

### 3. Initialize Database

Run the schema migration and seed database records:

```bash
cd apps/api
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 4. Run Locally

From the root directory, run both frontend and backend development servers:

```bash
pnpm dev:api   # Runs NestJS on port 3001
pnpm dev:web   # Runs Next.js on port 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

### Backend (Railway) — [eap-production.up.railway.app](https://eap-production.up.railway.app)

1. Create a new project in Railway.
2. Select your repository and point to the `apps/api` folder.
3. Add the environment variables defined in `apps/api/.env.example`.
4. Copy the backend service URL for your frontend environment config.

### Frontend (Vercel) — [eap-red.vercel.app](https://eap-red.vercel.app)

1. Import your repository to Vercel.
2. Set the root directory to `apps/web`.
3. Set the environment variables, referencing `apps/web/.env.example`. Make sure `NEXT_PUBLIC_API_URL` points to your deployed backend URL.
4. Deploy the project.

### Run Database Migrations on Production

Run migrations and seed the production database:

```bash
cd apps/api
DATABASE_URL="your-production-database-url" pnpm db:migrate
DATABASE_URL="your-production-database-url" pnpm db:seed
```

---

## API Overview

| Method         | Endpoint                     | Description                           |
| :------------- | :--------------------------- | :------------------------------------ |
| POST           | `/api/auth/register`         | User registration                     |
| POST           | `/api/auth/login`            | User login                            |
| GET            | `/api/auth/me`               | Retrieve profile of the current user  |
| GET / POST     | `/api/projects`              | List projects or create a new project |
| PATCH / DELETE | `/api/projects/:id`          | Update or delete a project            |
| POST / DELETE  | `/api/projects/:id/members`  | Add or remove members from a project  |
| GET / POST     | `/api/tasks`                 | List tasks or create a new task       |
| PATCH          | `/api/tasks/:id/status`      | Update task status                    |
| GET / POST     | `/api/tasks/:id/comments`    | List or create task comments          |
| GET / POST     | `/api/tasks/:id/attachments` | List or upload task attachments       |
| GET            | `/api/activity`              | Get recent activity logs              |
| GET            | `/api/notifications`         | Get user notifications                |
| GET            | `/api/users`                 | List team members                     |
| GET            | `/api/users/:id/workload`    | Get workload data for a specific user |
