# CampusConnect — College Event Management System

A production-ready, full-stack web application for managing university and college campus events, student seat registrations, participant rosters, and live demographic analytics. Built with **React 18 + Vite + TypeScript, Go 1.24 (Fiber v2), PostgreSQL 16/17, and Docker Compose**.

Localized for **Tamil Nadu collegiate institutions** (Anna University, PSG Tech, MIT Chromepet, SSN, and TCE Madurai) with Indian standard mobile numbers (`+91` 10-digit).

---

## Key Highlights & Features

- **Dynamic Hero Event Showcase**: Smooth, animated background carousel displaying crystal-clear photos of flagship events, including ***Campus Sangamam: Inter-College Cultural Extravaganza 2026*** at Vivekananda Auditorium, CEG Campus, Guindy.
- **Active Navigation Highlights**: High-contrast vibrant teal pills clearly indicate active pages (`Browse Events`, `Teacher Dashboard`, `Student Portal`, `My Registrations`).
- **Clean Slate Initial State**: Zero dummy event bookings seeded in `event_registrations` so evaluators and examiners can experience live, real-time seat reservation from a fresh starting point.
- **Concurrency-Safe Registrations**: PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) guarantees zero overbooking or race conditions, even during high-traffic registration rushes.
- **Faculty / Organizer Suite**: Authenticated professors can create, edit, publish, draft, and cancel events, track remaining capacity, and monitor live attendee numbers.
- **Interactive Demographic Analytics**: Real-time Chart.js visual charts breaking down participant rosters by department, academic year, and gender ratio.
- **1-Click Verified CSV Export**: Organizers can download attendance sheets in CSV format for offline accreditation and administrative reporting.
- **Student Portal & Pass Management**: 1-Click registration, instant pass confirmation, and self-service cancellation before registration deadlines.
- **Indian Format Validation**: Standardized `+91` 10-digit mobile number badge and strict regex validation.
- **Role-Based Access Control (RBAC)**: Secure HTTP-only JWT cookies and bearer tokens with Bcrypt password hashing.
- **Standalone Offline Walkthrough Guide**: Self-contained offline player [`CampusConnect_Walkthrough_Video.html`](./CampusConnect_Walkthrough_Video.html) for presenting student and teacher workflows without setting up external media players.

---

## Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript | Fast, typed Single Page Application |
| **Styling** | Tailwind CSS v3 | Responsive modern design system |
| **Data Visualization** | Chart.js, React-Chartjs-2 | Interactive demographic & capacity charts |
| **Icons** | Lucide React | High-contrast visual navigation icons |
| **Backend** | Go 1.24, Fiber v2 | High-throughput, low-latency REST API |
| **Database Pool** | pgxpool (jackc/pgx/v5) | High-performance PostgreSQL connection pooling |
| **Security & Auth** | Bcrypt, golang-jwt/v5 | Password hashing & role-based JWT authentication |
| **Database** | PostgreSQL 16/17 | ACID-compliant relational DB with row-level locks |
| **Web Server** | Nginx Alpine | Production reverse proxy & static asset delivery |
| **Orchestration** | Docker & Docker Compose | Multi-container automated startup |

---

## Project Structure

```
College-Event-Org/
├── frontend/
│   ├── src/
│   │   ├── api/client.ts              # Typed API client & CSV export trigger
│   │   ├── components/                # Navbar, Footer, EventCard, StatusBadge, Charts
│   │   ├── context/AuthContext.tsx    # Auth state & user session persistence
│   │   ├── pages/                     # Application pages (Home, Events, Dashboards, Profile, etc.)
│   │   ├── types/index.ts             # TypeScript domain models
│   │   ├── App.tsx                    # Route tree with role-protected guards
│   │   └── main.tsx                   # React root entrypoint
│   ├── nginx.conf                     # Nginx reverse proxy configuration
│   ├── package.json                   # Dependencies and scripts
│   ├── Dockerfile                     # Multi-stage production container
│   └── .env.example
├── backend/
│   ├── cmd/server/main.go             # Application entrypoint & routing
│   ├── internal/
│   │   ├── config/config.go           # Environment variables loader
│   │   ├── database/                  # pgx pool, schema migrations & Tamil Nadu seed data
│   │   ├── handlers/                  # Auth, Event CRUD, Registrations & Analytics
│   │   ├── middleware/                # JWT auth guards & role enforcement
│   │   ├── models/models.go           # Struct definitions & database DTOs
│   │   └── utils/                     # Password hashing, JWT & standardized JSON responses
│   ├── uploads/                       # Event poster storage directory
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile                     # Multi-stage Go static binary container
│   └── .env.example
├── docker-compose.yml                 # PostgreSQL, Go Fiber API & React Nginx services
├── CampusConnect_Walkthrough_Video.html # Standalone offline interactive guide
├── .env.example                       # Root environment template
└── README.md
```

---

## Quick Start with Docker (Recommended)

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Git](https://git-scm.com/) installed.

### 2. Clone and Setup Environment
```bash
git clone https://github.com/Abinesh09/College-Event-Org.git
cd College-Event-Org
```

Create `.env` from template:
```powershell
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

### 3. Launch Services
```bash
docker compose up --build -d
```

### 4. Access URLs
- **Web Portal**: [http://localhost](http://localhost) (Port `80`)
- **Backend API**: [http://localhost:9092/api/events](http://localhost:9092/api/events)
- **Backend Health Check**: [http://localhost:9092/health](http://localhost:9092/health)
- **PostgreSQL Database**: Port `5433` (mapped from container `5432` to avoid local port conflicts)

To view real-time logs:
```bash
docker compose logs -f
```

To stop containers:
```bash
docker compose down
```

---

## Local Development (Without Docker)

### Run Backend Locally
Ensure PostgreSQL is running locally on port 5432 or 5433.
```bash
cd backend
go mod download
go run ./cmd/server
```
The API starts on `http://localhost:9092`.

### Run Frontend Locally
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The Vite development server starts at `http://localhost:5173` and automatically proxies `/api` calls to `http://localhost:9092`.

---

## Demo Accounts & Test Credentials

The database seeds authentic Tamil Nadu faculty and student demo profiles on first boot:

| Role | Name & College | Email | Password | Mobile (+91) |
| :--- | :--- | :--- | :--- | :--- |
| **Faculty / Organizer** | Prof. K. Anbarasan (*Anna University, CEG*) | `teacher@college.edu` | `Password123!` | `+91 98401 23456` |
| **Faculty / Organizer** | Dr. Meenakshi Sundaram (*PSG Tech*) | `sarah.faculty@college.edu` | `Password123!` | `+91 94432 44556` |
| **Student** | Karthik Raja (*CEG Anna University*) | `karthik.student@college.edu` | `Password123!` | `+91 98412 34567` |
| **Student** | Priya Natarajan (*SSN College of Eng*) | `priya.student@college.edu` | `Password123!` | `+91 97901 23456` |
| **Student** | Vigneshwaran S (*MIT Chromepet*) | `vignesh.student@college.edu` | `Password123!` | `+91 98840 98765` |
| **Student** | Kaviya Murugan (*PSG Tech*) | `kaviya.student@college.edu` | `Password123!` | `+91 94421 87654` |
| **Student** | Soundarya R (*TCE Madurai*) | `soundarya.student@college.edu` | `Password123!` | `+91 99430 11223` |

> **Pro-Tip**: The login page provides **"Quick Demo Auto-Fill"** buttons to log in with a single click without manual typing.

---

## Seeded Live Events

The system comes pre-loaded with Tamil Nadu inter-college events:

1. 🎭 **Campus Sangamam: Inter-College Cultural Extravaganza 2026**
   - *Venue*: Vivekananda Auditorium, CEG Campus, Guindy, Chennai
   - *Capacity*: 150 Seats
2. 💻 **InnovateX 2026: 36-Hour Tamil Nadu State Hackathon**
   - *Venue*: Ramanujan Computing Centre & TAG Auditorium, Anna University
   - *Capacity*: 120 Seats
3. 🤖 **RoboWars & Autonomous Drone Derby 2026**
   - *Venue*: GRD Open Air Theatre & Dynamics Arena, PSG Tech, Coimbatore
   - *Capacity*: 80 Seats
4. 🏃 **Tamil Nadu State Inter-Collegiate Athletic Championship**
   - *Venue*: Jawaharlal Nehru Stadium & Anna University Sports Pavilion
   - *Capacity*: 200 Seats
5. 🧠 **Generative AI & Agentic Systems Masterclass**
   - *Venue*: Dr. A.P.J. Abdul Kalam Convention Hall, SSN Campus, Kalavakkam
   - *Capacity*: 60 Seats

---

## Verification & Walkthrough Steps

### Testing Student Workflow:
1. Navigate to `http://localhost`.
2. Click **Log In** and choose student auto-fill (or log in with `karthik.student@college.edu`).
3. Click **Browse Events** from the top header (active tab highlights in solid teal).
4. Click **Campus Sangamam: Inter-College Cultural Extravaganza 2026**.
5. Click **Register for Event** — seats update in real time with concurrency safeguards.
6. Check **My Registrations** to view the confirmed seat pass and cancel option.

### Testing Teacher / Organizer Workflow:
1. Log in with `teacher@college.edu` (Prof. K. Anbarasan).
2. Click **Teacher Dashboard** in the header.
3. Review total events, active events, and registrations summary cards.
4. Click **View Attendees** on any event to see real-time student registrations with Tamil Nadu college names, roll numbers, and contact details.
5. Click **Demographics & Analytics** to see interactive department, gender, and academic year charts.
6. Click **Export CSV** to download a verified participant roster sheet.

---

## Database Reset Command

To wipe the database and re-seed cleanly:
```bash
docker compose down -v
docker compose up --build -d
```

---

## License

Developed for university demonstration and academic evaluation.
