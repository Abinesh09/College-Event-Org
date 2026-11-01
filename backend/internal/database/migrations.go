package database

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func RunMigrations(pool *pgxpool.Pool) error {
	ctx := context.Background()

	migrationSQL := `
	CREATE EXTENSION IF NOT EXISTS "pgcrypto";

	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		full_name VARCHAR(150) NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student')),
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
	CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

	CREATE TABLE IF NOT EXISTS student_profiles (
		user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
		college_name VARCHAR(200) NOT NULL,
		student_id VARCHAR(50) NOT NULL,
		department VARCHAR(100) NOT NULL,
		year_of_study VARCHAR(50) NOT NULL,
		date_of_birth DATE,
		age INT,
		gender VARCHAR(50),
		phone_number VARCHAR(30)
	);

	CREATE INDEX IF NOT EXISTS idx_student_profiles_dept ON student_profiles(department);
	CREATE INDEX IF NOT EXISTS idx_student_profiles_year ON student_profiles(year_of_study);
	CREATE INDEX IF NOT EXISTS idx_student_profiles_gender ON student_profiles(gender);

	CREATE TABLE IF NOT EXISTS events (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		title VARCHAR(255) NOT NULL,
		short_description VARCHAR(500) NOT NULL,
		description TEXT NOT NULL,
		category VARCHAR(100) NOT NULL,
		event_type VARCHAR(50) NOT NULL,
		event_date DATE NOT NULL,
		start_time VARCHAR(20) NOT NULL,
		end_time VARCHAR(20) NOT NULL,
		venue VARCHAR(255) NOT NULL,
		organizing_department VARCHAR(100) NOT NULL,
		registration_open_at TIMESTAMPTZ NOT NULL,
		registration_deadline TIMESTAMPTZ NOT NULL,
		max_participants INT NOT NULL DEFAULT 100,
		eligibility_criteria TEXT DEFAULT '',
		poster_url TEXT DEFAULT '',
		contact_info TEXT DEFAULT '',
		status VARCHAR(30) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
	CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
	CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
	CREATE INDEX IF NOT EXISTS idx_events_dept ON events(organizing_department);
	CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

	CREATE TABLE IF NOT EXISTS event_registrations (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
		student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
		CONSTRAINT unique_event_student UNIQUE (event_id, student_id)
	);

	CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
	CREATE INDEX IF NOT EXISTS idx_registrations_student ON event_registrations(student_id);
	CREATE INDEX IF NOT EXISTS idx_registrations_status ON event_registrations(status);

	CREATE TABLE IF NOT EXISTS system_metadata (
		key VARCHAR(100) PRIMARY KEY,
		value VARCHAR(255) NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);
	`

	_, err := pool.Exec(ctx, migrationSQL)
	if err != nil {
		return fmt.Errorf("migration failed: %w", err)
	}

	log.Println("Database migrations applied successfully")
	return nil
}

