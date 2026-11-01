# CampusConnect — College Event Management System

[![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go)](https://go.dev/)
[![React Version](https://img.shields.io/badge/React-18%2F19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2F17-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Docker Compose](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://www.docker.com/)

A modern, full-stack, responsive college event management web application. Built with **React (Vite + TypeScript + Tailwind CSS)** on the frontend, **Go (Fiber v2/v3 + pgxpool)** on the backend, **PostgreSQL** for relational persistence, and containerized with **Docker & Docker Compose**.

CampusConnect empowers college teachers to publish and manage events with custom seat capacities and registration deadlines. Students can browse events, register with their academic and demographic details, and manage their reservations. Organizers can supervise verified attendee rosters, filter by department and gender, inspect interactive charts, and export participant records to CSV.

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 19 + Vite + TypeScript)"]
        UI["Tailwind CSS UI & Components"]
        AuthContext["Auth Context & JWT Storage"]
        Charts["Chart.js / Demographic Visualizations"]
    end

    subgraph Server ["Backend (Go + Fiber)"]
        Router["Fiber REST Router (/api)"]
        AuthMiddleware["JWT & Role Guard Middleware"]
        Handlers["Event, Registration & Analytics Handlers"]
        TxLock["Row-Level Transaction Lock (FOR UPDATE)"]
    end

    subgraph Storage ["Database (PostgreSQL)"]
        UsersTbl[("users (Bcrypt Hashed)")]
        ProfilesTbl[("student_profiles")]
        EventsTbl[("events")]
        RegsTbl[("event_registrations (Unique Constraint)")]
    end

    UI --> Router
    Router --> AuthMiddleware
    AuthMiddleware --> Handlers
    Handlers --> TxLock
    TxLock --> Storage
```

---

## 2. Key Features

### Role-Based Access Control
- **Teacher / Event Organizer**:
  - Secure login with pre-seeded demo teacher accounts (public registration cannot create teacher accounts).
  - Create, update, draft, publish, or cancel college events.
  - Set participant capacity limits, registration deadlines, and eligibility rules.
  - Searchable and filterable participant table (by department, academic year, gender, and status).
  - View real-time aggregated demographic charts (department distribution, academic year, gender representation, and capacity utilization).
  - Export participant rosters to CSV stream.
  - Event ownership strictly enforced (teachers can only edit or view attendees for events they created).

- **Student**:
  - Public registration form with academic information (college, department, year of study, student ID) and optional demographic fields (age, gender with *"Prefer not to say"*, phone).
  - Password securely hashed with Bcrypt (never exposed to teachers or stored in plaintext).
  - Browse and search published events with real-time seat availability.
  - 1-Click event registration with instant seat reservation.
  - View confirmed event passes under "My Registrations".
  - Cancel registrations prior to event start if plans change.

### Concurrency-Safe Registrations
- Database transactions use **exclusive row-level locking** (`SELECT ... FOR UPDATE` on the event row) to prevent overbooking and race conditions when multiple students register simultaneously.
- PostgreSQL `UNIQUE (event_id, student_id)` constraint prevents duplicate registrations.

### Dynamic Operational Status
The backend dynamically calculates operational statuses:
- `Draft`: Event saved as draft by teacher.
- `Upcoming`: Registration date window has not opened yet.
- `Registration Open`: Currently open for registration with remaining seats.
- `Full`: Current confirmed registrations have reached `max_participants`.
- `Registration Closed`: Registration deadline has passed.
- `Completed`: Event date has passed.
- `Cancelled`: Teacher marked event as cancelled.

---

## 3. Pre-Seeded Demo Credentials

The database automatically seeds realistic demo data on initial startup:

| Role | Email Address | Password | Name & Department |
| :--- | :--- | :--- | :--- |
| **Teacher / Organizer** | `teacher@college.edu` | `Password123!` | Prof. Alan Turing (Computer Science) |
| **Teacher / Organizer** | `sarah.faculty@college.edu` | `Password123!` | Dr. Sarah Connor (Mechanical Eng) |
| **Student** | `alex.student@college.edu` | `Password123!` | Alex Rivera (CS 3rd Year) |
| **Student** | `priya.student@college.edu` | `Password123!` | Priya Sharma (ECE 2nd Year) |
| **Student** | `marcus.student@college.edu` | `Password123!` | Marcus Vance (Mech 4th Year) |

> **Tip:** You can also use the **"Quick Demo Auto-Fill"** buttons on the Login page for 1-click credential filling!

---

## 4. Quickstart with Docker Compose

Running the entire stack with Docker Compose is the recommended way to test and present CampusConnect.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Start the Application
```bash
docker compose up --build
```

### Services Started:
- **Frontend**: Accessible at [http://localhost](http://localhost) (or port 80).
- **Backend API**: Accessible at [http://localhost:8080/health](http://localhost:8080/health).
- **PostgreSQL**: Running on port `5433` (mapped from container `5432` to avoid host conflicts with any local PostgreSQL instance).

### Stop the Application
```bash
docker compose down
```

### Reset Database Volume (Fresh Seed)
```bash
docker compose down -v
docker compose up --build
```

---

## 5. Local Development (Without Docker)

You can also run both the Go backend and React frontend directly on your host machine.

### Prerequisites
- Go `1.22+` (or `1.25+`)
- Node.js `v20+` or `v22+` & npm
- PostgreSQL running locally

### 1. Database Setup
Create a PostgreSQL database named `campusconnect`:
```sql
CREATE DATABASE campusconnect;
```
Configure your credentials in `.env`:
```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/campusconnect?sslmode=disable
```

### 2. Start Go Backend
```bash
cd backend
go run ./cmd/server
```
*The server will automatically apply schema migrations and seed demo data on first start on port `8080`.*

### 3. Start React Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. REST API Endpoints

### Authentication
- `POST /api/auth/register` — Public student account onboarding (role locked to `student`).
- `POST /api/auth/login` — Sign in with email and password (returns JWT & user profile).
- `POST /api/auth/logout` — Clear session cookie.
- `GET /api/auth/me` — Retrieve current authenticated user profile.
- `PUT /api/auth/profile` — Update student profile fields.

### Public & Student Events
- `GET /api/events` — List published events with query filters (`search`, `category`, `event_type`, `department`, `status`, `page`, `limit`).
- `GET /api/events/:id` — View event details, seat capacity, and registration status.
- `POST /api/events/:id/register` — Concurrency-safe student registration.
- `DELETE /api/events/:id/register` — Cancel confirmed registration.
- `GET /api/me/registrations` — View student's registered event passes.

### Teacher & Organizer Suite (Requires `teacher` role)
- `GET /api/teacher/dashboard` — Summary metrics (total events, active, registrations, upcoming, completed).
- `GET /api/teacher/events` — List events owned by authenticated teacher.
- `POST /api/events` — Create new event (draft or published).
- `PUT /api/events/:id` — Update event logistics (ownership strictly verified).
- `PATCH /api/events/:id/status` — Change event status (`draft`, `published`, `cancelled`, `completed`).
- `DELETE /api/events/:id` — Delete event.
- `POST /api/upload` — Upload event poster image.
- `GET /api/teacher/events/:id/participants` — Searchable, filterable student participant table.
- `GET /api/teacher/events/:id/statistics` — Department, academic year, and gender demographic breakdowns.
- `GET /api/teacher/events/:id/export` — Stream CSV download of verified attendees.

---

## 7. PostgreSQL Database Schema

```mermaid
erDiagram
    users ||--o| student_profiles : "has"
    users ||--o{ events : "organizes"
    users ||--o{ event_registrations : "registers"
    events ||--o{ event_registrations : "contains"

    users {
        uuid id PK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar role
        timestamptz created_at
        timestamptz updated_at
    }

    student_profiles {
        uuid user_id PK, FK
        varchar college_name
        varchar student_id
        varchar department
        varchar year_of_study
        date date_of_birth
        int age
        varchar gender
        varchar phone_number
    }

    events {
        uuid id PK
        uuid organizer_id FK
        varchar title
        varchar short_description
        text description
        varchar category
        varchar event_type
        date event_date
        varchar start_time
        varchar end_time
        varchar venue
        varchar organizing_department
        timestamptz registration_open_at
        timestamptz registration_deadline
        int max_participants
        text eligibility_criteria
        text poster_url
        text contact_info
        varchar status
        timestamptz created_at
        timestamptz updated_at
    }

    event_registrations {
        uuid id PK
        uuid event_id FK
        uuid student_id FK
        timestamptz registered_at
        varchar status
    }
```

---

## 8. Acceptance Criteria Verification

- [x] **Teacher Login & Event Creation**: Teachers log in using secure demo credentials and can publish, draft, edit, and cancel events.
- [x] **Public Student Registration**: Students register with academic details (department, roll no, year) and demographic fields. Role is strictly locked to `student`.
- [x] **Concurrency & Race-Condition Safety**: Registration uses `SELECT ... FOR UPDATE` inside a PostgreSQL transaction to strictly prevent overbooking.
- [x] **Participant Management**: Searchable participant roster with student name, ID, department, year, age, gender, and status.
- [x] **Demographic Charts**: Interactive bar charts (department, academic year), doughnut charts (gender), and capacity progress gauges.
- [x] **CSV Export**: Organizers can download verified attendee rosters in standard CSV format with 1 click.
- [x] **Access Control**: Protected routes and Go middleware ensure students cannot access teacher APIs, and teachers cannot access other teachers' events.
- [x] **Docker Containerization**: Multi-stage Dockerfiles and `docker-compose.yml` with database health checks and persistent volume storage.
