# CampusConnect — College Event Management System

A full-stack web application for managing college events, student registrations, and participant statistics. Built with **React, Go, PostgreSQL, and Docker**.

---

## Features

- **Teacher Login and Event Management**: Authenticated teachers create, edit, publish, draft, and cancel events.
- **Seat Capacity & Concurrency Safety**: Row-level locking (`SELECT ... FOR UPDATE`) prevents overbooking and race conditions during simultaneous registrations.
- **Student Registration & Login**: Public student onboarding with department, roll number, and demographic options. Passwords securely hashed with Bcrypt.
- **Browse & Filter Events**: Search and filter open events by department, category, date, and event type.
- **Student Dashboard & Reservations**: 1-Click event registration, view confirmed event passes, and cancel registrations prior to event start.
- **Participant Rosters**: Teachers can view, search, and paginate through verified attendee lists with full demographic records.
- **Demographic Statistics & Charts**: Real-time interactive charts displaying registrations by department, academic year, gender, and capacity utilization.
- **1-Click CSV Export**: Organizers can download verified attendee rosters in standard CSV format.
- **Role-Based Access Control (RBAC)**: Secure JWT cookies/headers with backend role enforcement and frontend protected routes.
- **Data Persistence**: Automated PostgreSQL schema migrations and persistent Docker volumes.

---

## Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React + Vite + TypeScript** | Frontend Single Page Application |
| **Tailwind CSS** | Responsive UI & Modern Design System |
| **Chart.js & React-Chartjs-2** | Interactive Demographic & Capacity Charts |
| **Go + Fiber** | Backend REST API |
| **pgxpool (jackc/pgx/v5)** | High-performance PostgreSQL Connection Pooling |
| **Bcrypt & JWT (golang-jwt/v5)** | Secure Password Hashing & Session Tokens |
| **PostgreSQL 16/17** | Relational Database with Row-Level Transaction Locks |
| **Docker & Nginx** | Containerization & Reverse Proxy |
| **Docker Compose** | Multi-Container Service Orchestration |

---

## Project Structure

```
College-Event-Org/
├── frontend/
│   ├── src/
│   │   ├── api/client.ts              # API fetch client & CSV download utility
│   │   ├── components/                # Navbar, Footer, EventCard, StatusBadge, Charts & Modals
│   │   ├── context/AuthContext.tsx    # Auth state & user session persistence
│   │   ├── pages/                     # 14 Full-featured application pages
│   │   ├── types/index.ts             # TypeScript interfaces
│   │   ├── App.tsx                    # Route definitions & guards
│   │   └── main.tsx                   # React root entry
│   ├── nginx.conf                     # Nginx reverse proxy configuration
│   ├── package.json                   # Dependencies & scripts
│   ├── Dockerfile                     # Multi-stage production container
│   └── .env.example
├── backend/
│   ├── cmd/server/main.go             # Application entrypoint & route wiring
│   ├── internal/
│   │   ├── config/config.go           # Environment configuration loader
│   │   ├── database/                  # pgx pool, migrations & demo seeds
│   │   ├── handlers/                  # Auth, Event CRUD, Registrations & Teacher Analytics
│   │   ├── middleware/                # JWT auth guards & role check middleware
│   │   ├── models/models.go           # Struct definitions & DTOs
│   │   └── utils/                     # Password hashing, JWT & standardized JSON responses
│   ├── uploads/                       # Static event poster uploads directory
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile                     # Multi-stage Go static binary container
│   └── .env.example
├── docker-compose.yml                 # PostgreSQL, Go API & React services
├── .env.example                       # Root environment template
└── README.md
```

---

## Prerequisites

Install the following software:

- **Git**
- **Go** (v1.22+ or v1.25+)
- **Node.js** (v20+ or v22+) and **npm**
- **Docker Desktop** (must be running for containerized workflow)

---

## 1. Clone the Repository

```bash
git clone https://github.com/Abinesh09/College-Event-Org.git
cd College-Event-Org
```

---

## 2. Configure Environment Variables

Create a root `.env` file using the provided example:

On Linux / macOS:
```bash
cp .env.example .env
```

On Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Configure database credentials, JWT secrets, and port settings as required. Never commit the actual `.env` file to Git.

---

## 3. Run the Entire Application Using Docker

From the project root:

```bash
docker compose up --build
```

To run in the background (detached mode):

```bash
docker compose up --build -d
```

Check running containers:

```bash
docker compose ps
```

View application logs:

```bash
docker compose logs -f
```

Stop the application:

```bash
docker compose down
```

Stop the application without deleting the database volume. Your saved database data will remain available when you start it again.

To reset the database completely (erasing all stored tables and re-running migrations/seed):

```bash
docker compose down -v
```

> **Warning:** This removes named Docker volumes, including all persistent database data.

### Access URLs:
- **Frontend Web Portal**: [http://localhost](http://localhost) (Port `80`)
- **Backend Health Check**: [http://localhost:8080/health](http://localhost:8080/health)
- **PostgreSQL**: Accessible on host port `5433` (mapped from container `5432` to avoid conflicts with any local PostgreSQL instance)

---

## 4. Run the Frontend Separately (Local Dev)

Open a terminal in the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

Vite starts the frontend development server at:

```
http://localhost:5173
```

The Vite dev server is pre-configured to proxy `/api` and `/uploads` requests automatically to `http://localhost:8080`.

---

## 5. Run the Go Backend Separately (Local Dev)

Open another terminal in the `backend` folder:

```bash
cd backend
go mod download
go run ./cmd/server
```

You can also build the static binary directly:

```bash
go build -o bin/server ./cmd/server
./bin/server
```

The API starts on `http://localhost:8080`.

---

## 6. Database Setup

PostgreSQL persists:
- User accounts and Bcrypt password hashes
- Student profiles (department, student ID, year of study, age, gender, phone)
- Event details (dates, venue, category, organizer, poster URL, capacity limits)
- Student registrations with unique constraints and timestamps

When using **Docker Compose**, PostgreSQL starts automatically as a healthy service with a persistent volume (`postgres_data`).
When running **locally without Docker**, ensure PostgreSQL is running and update `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/campusconnect?sslmode=disable
```

Schema migrations and demo seed records run automatically on backend startup.

---

## 7. Demo Accounts & Testing

The system automatically initializes demo accounts on first launch for immediate testing and presentation:

| Role | Email | Password | Name & Department |
| :--- | :--- | :--- | :--- |
| **Teacher / Organizer** | `teacher@college.edu` | `Password123!` | Prof. Alan Turing (*Computer Science*) |
| **Teacher / Organizer** | `sarah.faculty@college.edu` | `Password123!` | Dr. Sarah Connor (*Mechanical Eng*) |
| **Student** | `alex.student@college.edu` | `Password123!` | Alex Rivera (*CS 3rd Year*) |
| **Student** | `priya.student@college.edu` | `Password123!` | Priya Sharma (*ECE 2nd Year*) |
| **Student** | `marcus.student@college.edu` | `Password123!` | Marcus Vance (*Mech 4th Year*) |

> **Pro-Tip**: The login page includes **"Quick Demo Auto-Fill"** buttons to log in with a single click without manual typing.

### Testing the Student Workflow:
1. Click **Student Register** or log in with `alex.student@college.edu`.
2. Browse upcoming events in the directory.
3. Open an event details page to view available seats and registration rules.
4. Click **Register for Event** to confirm your seat reservation.
5. Visit **My Registrations** to view your active event pass or cancel if needed.

### Testing the Teacher Workflow:
1. Log in using `teacher@college.edu` (Password: `Password123!`).
2. Go to **Teacher Dashboard** to inspect summary metric cards.
3. Click **Create New Event**, fill out the schedule and capacity, and click **Publish Event**.
4. Open **View Attendees** on an event to see the searchable student roster.
5. Click **Demographics & Charts** to view real-time department, academic year, and gender breakdowns.
6. Click **Export CSV** to download the registrant roster.

---

## 8. Troubleshooting

### Docker command not found
Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), start it from the Start Menu, and reopen your terminal.

### Database connection failed
Verify the database credentials, hostname, and port in `.env`.
Inside Docker Compose, the backend connects to PostgreSQL using the service name `postgres:5432`, not `localhost`.
When running locally on Windows host, ensure your local PostgreSQL service is running.

### Port already in use
- Host port `5432` busy? `docker-compose.yml` maps PostgreSQL to host port `5433` by default (`${DB_HOST_PORT:-5433}:5432`) to prevent conflicts.
- Host port `80` busy? Change `FRONTEND_PORT=3000` in `.env` to run the web interface on `http://localhost:3000`.

### Tables or seed data missing
The backend automatically runs `database.RunMigrations()` and `database.SeedDatabase()` on boot. If you need a fresh reset:
```bash
docker compose down -v
docker compose up --build
```

---

## Commands to Remember

| Action | Command |
| :--- | :--- |
| **Start everything** | `docker compose up --build` |
| **Run in background** | `docker compose up --build -d` |
| **View logs** | `docker compose logs -f` |
| **Stop services** | `docker compose down` |
| **Reset database** | `docker compose down -v` |
| **Run frontend locally** | `cd frontend && npm install && npm run dev` |
| **Run backend locally** | `cd backend && go run ./cmd/server` |

---

## License

This project is developed for educational and college demonstration purposes. Add an open-source license (such as MIT) if you intend to distribute it publicly.
