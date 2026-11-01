package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"campusconnect/internal/utils"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SeedDatabase(pool *pgxpool.Pool) error {
	ctx := context.Background()

	// 1. Check if initial seeding was already completed in the past
	var seedCompleted bool
	err := pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM system_metadata WHERE key = 'initial_seed_completed')").Scan(&seedCompleted)
	if err == nil && seedCompleted {
		log.Println("Initial database seed already executed previously. Skipping seed to respect user deletions.")
		return nil
	}

	// 2. If data already exists (e.g. from prior schema without metadata), flag it and skip
	var userCount int
	_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&userCount)
	if userCount > 0 {
		_, _ = pool.Exec(ctx, "INSERT INTO system_metadata (key, value) VALUES ('initial_seed_completed', 'true') ON CONFLICT (key) DO NOTHING")
		log.Println("Existing data detected; marked initial_seed_completed = true to prevent re-seeding if records are deleted.")
		return nil
	}

	log.Println("Seeding database with demo teachers, students, and events...")

	hashedPassword, err := utils.HashPassword("Password123!")
	if err != nil {
		return fmt.Errorf("failed to hash seed password: %w", err)
	}

	// 1. Seed Teachers
	var teacher1ID, teacher2ID string
	err = pool.QueryRow(ctx, `
		INSERT INTO users (full_name, email, password_hash, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, "Prof. K. Anbarasan", "teacher@college.edu", hashedPassword, "teacher").Scan(&teacher1ID)
	if err != nil {
		return fmt.Errorf("failed to seed teacher 1: %w", err)
	}

	err = pool.QueryRow(ctx, `
		INSERT INTO users (full_name, email, password_hash, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, "Dr. Meenakshi Sundaram", "sarah.faculty@college.edu", hashedPassword, "teacher").Scan(&teacher2ID)
	if err != nil {
		return fmt.Errorf("failed to seed teacher 2: %w", err)
	}

	// 2. Seed Students and Profiles (Tamil Nadu Colleges & +91 Mobile Numbers)
	type seedStudent struct {
		name    string
		email   string
		college string
		id      string
		dept    string
		year    string
		dob     string
		age     int
		gender  string
		phone   string
	}

	students := []seedStudent{
		{
			name:    "Karthik Raja",
			email:   "alex.student@college.edu",
			college: "Anna University (CEG Campus, Chennai)",
			id:      "21CS042",
			dept:    "Computer Science",
			year:    "3rd Year",
			dob:     "2004-03-15",
			age:     22,
			gender:  "Male",
			phone:   "+91 98401 23456",
		},
		{
			name:    "Priya Natarajan",
			email:   "priya.student@college.edu",
			college: "PSG College of Technology, Coimbatore",
			id:      "717822P118",
			dept:    "Electronics & Communication",
			year:    "2nd Year",
			dob:     "2005-08-22",
			age:     21,
			gender:  "Female",
			phone:   "+91 97890 12345",
		},
		{
			name:    "Vigneshwaran S",
			email:   "marcus.student@college.edu",
			college: "Madras Institute of Technology (MIT), Chromepet",
			id:      "2021MIT089",
			dept:    "Mechanical Engineering",
			year:    "4th Year",
			dob:     "2003-11-05",
			age:     23,
			gender:  "Male",
			phone:   "+91 94441 56789",
		},
		{
			name:    "Kaviya Murugan",
			email:   "aisha.student@college.edu",
			college: "Thiagarajar College of Engineering (TCE), Madurai",
			id:      "22TCE012",
			dept:    "Civil Engineering",
			year:    "1st Year",
			dob:     "2006-02-14",
			age:     20,
			gender:  "Female",
			phone:   "+91 99402 34567",
		},
		{
			name:    "Soundarya R",
			email:   "elena.student@college.edu",
			college: "SSN College of Engineering, Kalavakkam",
			id:      "SSN2023IT77",
			dept:    "Information Technology",
			year:    "3rd Year",
			dob:     "2004-07-19",
			age:     22,
			gender:  "Female",
			phone:   "+91 98840 67890",
		},
	}

	var studentIDs []string
	for _, s := range students {
		var sID string
		err = pool.QueryRow(ctx, `
			INSERT INTO users (full_name, email, password_hash, role)
			VALUES ($1, $2, $3, $4)
			RETURNING id
		`, s.name, s.email, hashedPassword, "student").Scan(&sID)
		if err != nil {
			return fmt.Errorf("failed to seed student %s: %w", s.email, err)
		}

		_, err = pool.Exec(ctx, `
			INSERT INTO student_profiles (user_id, college_name, student_id, department, year_of_study, date_of_birth, age, gender, phone_number)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, sID, s.college, s.id, s.dept, s.year, s.dob, s.age, s.gender, s.phone)
		if err != nil {
			return fmt.Errorf("failed to seed student profile %s: %w", s.email, err)
		}

		studentIDs = append(studentIDs, sID)
	}

	// 3. Seed Events
	now := time.Now()
	event1Date := now.AddDate(0, 0, 7).Format("2006-01-02")
	event2Date := now.AddDate(0, 0, 14).Format("2006-01-02")
	event3Date := now.AddDate(0, 0, 21).Format("2006-01-02")
	event4Date := now.AddDate(0, 0, 4).Format("2006-01-02")
	event5Date := now.AddDate(0, 0, 18).Format("2006-01-02")
	draftDate := now.AddDate(0, 1, 0).Format("2006-01-02")

	type seedEvent struct {
		organizerID  string
		title        string
		shortDesc    string
		desc         string
		category     string
		eventType    string
		date         string
		startTime    string
		endTime      string
		venue        string
		dept         string
		openAt       time.Time
		deadline     time.Time
		maxSeats     int
		criteria     string
		poster       string
		contact      string
		status       string
	}

	eventsList := []seedEvent{
		{
			organizerID:  teacher1ID,
			title:        "InnovateX 2026: 36-Hour Tamil Nadu State Hackathon",
			shortDesc:    "State-level software and hardware sprint tackling real-world sustainability and AI challenges.",
			desc:         "Join over 50 visionary student developers, designers, and innovators from across Tamil Nadu for 36 hours of non-stop creativity. Build groundbreaking web applications, AI models, and IoT gadgets with mentorship from industry architects and cash prizes over ₹1,00,000.",
			category:     "Technology",
			eventType:    "technical",
			date:         event1Date,
			startTime:    "09:00 AM",
			endTime:      "09:00 PM",
			venue:        "Ramanujan Computing Centre & TAG Auditorium, Anna University, Chennai",
			dept:         "Computer Science",
			openAt:       now.AddDate(0, 0, -5),
			deadline:     now.AddDate(0, 0, 5),
			maxSeats:     50,
			criteria:     "Open to all undergraduate and postgraduate engineering and tech students in Tamil Nadu.",
			poster:       "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
			contact:      "Prof. K. Anbarasan (+91 98401 11223 | hackathon@annauniv.edu)",
			status:       "published",
		},
		{
			organizerID:  teacher2ID,
			title:        "RoboWars & Autonomous Drone Derby 2026",
			shortDesc:    "Combat robot battles, obstacle racecourses, and automated drone precision flight challenges.",
			desc:         "Witness the clash of high-torque combat bots and high-velocity FPV quadcopters. Teams will compete in battle arenas, line-tracking challenges, and autonomous payload delivery circuits.",
			category:     "Robotics",
			eventType:    "technical",
			date:         event2Date,
			startTime:    "10:00 AM",
			endTime:      "05:00 PM",
			venue:        "GRD Open Air Theatre & Dynamics Arena, PSG Tech, Peelamedu, Coimbatore",
			dept:         "Mechanical Engineering",
			openAt:       now.AddDate(0, 0, -3),
			deadline:     now.AddDate(0, 0, 10),
			maxSeats:     40,
			criteria:     "Robotics teams of 1 to 4 members. Safety check mandatory before weigh-in.",
			poster:       "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
			contact:      "Dr. Meenakshi Sundaram (+91 94432 44556 | robotics@psgtech.ac.in)",
			status:       "published",
		},
		{
			organizerID:  teacher1ID,
			title:        "Campus Sangamam: Inter-College Cultural Extravaganza 2026",
			shortDesc:    "The biggest celebration of Tamil culture, music, theatrical arts, dance ensembles, and creative expression.",
			desc:         "A 3-day fest bringing together students from across 40 Tamil Nadu engineering & arts colleges. Features solo vocals, battle of the bands, classical Bharatanatyam fusion choreography, standup comedy, and street plays.",
			category:     "Cultural",
			eventType:    "cultural",
			date:         event3Date,
			startTime:    "05:00 PM",
			endTime:      "10:00 PM",
			venue:        "Vivekananda Auditorium, CEG Campus, Guindy, Chennai",
			dept:         "Student Cultural Affairs",
			openAt:       now.AddDate(0, 0, -2),
			deadline:     now.AddDate(0, 0, 18),
			maxSeats:     150,
			criteria:     "Open to all students with valid college ID.",
			poster:       "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
			contact:      "Cultural Affairs Committee (+91 98410 88990 | sangamam@annauniv.edu)",
			status:       "published",
		},
		{
			organizerID:  teacher1ID,
			title:        "Generative AI & Agentic Systems Masterclass",
			shortDesc:    "Hands-on workshop exploring LLM orchestration, vector databases, and multi-agent frameworks.",
			desc:         "Learn how to construct resilient AI agents with tools, structured outputs, memory, and RAG pipelines. Participants will write production code using modern models and cloud environments.",
			category:     "AI & Data Science",
			eventType:    "workshop",
			date:         event4Date,
			startTime:    "02:00 PM",
			endTime:      "06:00 PM",
			venue:        "Dr. A.P.J. Abdul Kalam Convention Hall, MIT Campus, Chromepet, Chennai",
			dept:         "Computer Science",
			openAt:       now.AddDate(0, 0, -10),
			deadline:     now.AddDate(0, 0, 3),
			maxSeats:     60,
			criteria:     "Basic proficiency in Python and REST APIs recommended.",
			poster:       "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
			contact:      "Prof. K. Anbarasan (+91 98401 11223 | cs-events@annauniv.edu)",
			status:       "published",
		},
		{
			organizerID:  teacher2ID,
			title:        "Tamil Nadu State Inter-Collegiate Athletic Championship",
			shortDesc:    "Sprint track events, relays, basketball, volleyball, and badminton tournaments.",
			desc:         "Compete for the championship trophy in track and field, basketball, and table tennis. Medals and state-level qualifying certificates awarded to winners.",
			category:     "Sports",
			eventType:    "sports",
			date:         event5Date,
			startTime:    "08:00 AM",
			endTime:      "04:00 PM",
			venue:        "Jawaharlal Nehru Stadium & Anna University Sports Complex, Chennai",
			dept:         "Physical Education",
			openAt:       now.AddDate(0, 0, -5),
			deadline:     now.AddDate(0, 0, 12),
			maxSeats:     80,
			criteria:     "Medical fitness clearance required on day of reporting.",
			poster:       "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
			contact:      "Physical Education Director (+91 94440 22334 | sports@annauniv.edu)",
			status:       "published",
		},
		{
			organizerID:  teacher1ID,
			title:        "Cloud Native Kubernetes & Microservices Bootcamp",
			shortDesc:    "Draft curriculum for modern container deployment and observability pipeline.",
			desc:         "Interactive laboratory on orchestrating distributed containers, Helm charts, and continuous delivery.",
			category:     "Cloud Computing",
			eventType:    "workshop",
			date:         draftDate,
			startTime:    "10:00 AM",
			endTime:      "03:00 PM",
			venue:        "Sir C.V. Raman Computing Lab, TCE Campus, Madurai",
			dept:         "Computer Science",
			openAt:       now.AddDate(0, 0, 10),
			deadline:     now.AddDate(0, 0, 25),
			maxSeats:     30,
			criteria:     "Prior experience with Linux command line.",
			poster:       "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
			contact:      "Prof. K. Anbarasan (+91 98401 11223 | cloud@annauniv.edu)",
			status:       "draft",
		},
	}

	var createdEventIDs []string
	for _, e := range eventsList {
		var eID string
		err = pool.QueryRow(ctx, `
			INSERT INTO events (
				organizer_id, title, short_description, description, category, event_type,
				event_date, start_time, end_time, venue, organizing_department,
				registration_open_at, registration_deadline, max_participants,
				eligibility_criteria, poster_url, contact_info, status
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
			) RETURNING id
		`, e.organizerID, e.title, e.shortDesc, e.desc, e.category, e.eventType,
			e.date, e.startTime, e.endTime, e.venue, e.dept,
			e.openAt, e.deadline, e.maxSeats, e.criteria, e.poster, e.contact, e.status,
		).Scan(&eID)
		if err != nil {
			return fmt.Errorf("failed to seed event %s: %w", e.title, err)
		}
		createdEventIDs = append(createdEventIDs, eID)
	}

	// Flag initial seed as permanently completed so future deletions are never overwritten
	_, _ = pool.Exec(ctx, "INSERT INTO system_metadata (key, value) VALUES ('initial_seed_completed', 'true') ON CONFLICT (key) DO NOTHING")

	log.Println("Seed data successfully populated (clean initial state with 0 test registrations) and flagged in system_metadata!")
	return nil
}

