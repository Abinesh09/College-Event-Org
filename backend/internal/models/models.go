package models

import "time"

type Role string

const (
	RoleTeacher Role = "teacher"
	RoleStudent Role = "student"
)

type User struct {
	ID           string          `json:"id"`
	FullName     string          `json:"full_name"`
	Email        string          `json:"email"`
	PasswordHash string          `json:"-"`
	Role         string          `json:"role"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	Profile      *StudentProfile `json:"profile,omitempty"`
}

type StudentProfile struct {
	UserID      string  `json:"user_id"`
	CollegeName string  `json:"college_name"`
	StudentID   string  `json:"student_id"`
	Department  string  `json:"department"`
	YearOfStudy string  `json:"year_of_study"`
	DateOfBirth *string `json:"date_of_birth,omitempty"`
	Age         *int    `json:"age,omitempty"`
	Gender      *string `json:"gender,omitempty"`
	PhoneNumber *string `json:"phone_number,omitempty"`
}

type Event struct {
	ID                   string    `json:"id"`
	OrganizerID          string    `json:"organizer_id"`
	OrganizerName        string    `json:"organizer_name,omitempty"`
	Title                string    `json:"title"`
	ShortDescription     string    `json:"short_description"`
	Description          string    `json:"description"`
	Category             string    `json:"category"`
	EventType            string    `json:"event_type"`
	EventDate            string    `json:"event_date"` // YYYY-MM-DD
	StartTime            string    `json:"start_time"`
	EndTime              string    `json:"end_time"`
	Venue                string    `json:"venue"`
	OrganizingDepartment string    `json:"organizing_department"`
	RegistrationOpenAt   time.Time `json:"registration_open_at"`
	RegistrationDeadline time.Time `json:"registration_deadline"`
	MaxParticipants      int       `json:"max_participants"`
	EligibilityCriteria  string    `json:"eligibility_criteria"`
	PosterURL            string    `json:"poster_url"`
	ContactInfo          string    `json:"contact_info"`
	Status               string    `json:"status"` // draft, published, cancelled, completed
	ComputedStatus       string    `json:"computed_status"`
	CurrentRegistrations int       `json:"current_registrations"`
	AvailableSeats       int       `json:"available_seats"`
	IsRegistered         bool      `json:"is_registered,omitempty"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

type EventRegistration struct {
	ID           string    `json:"id"`
	EventID      string    `json:"event_id"`
	StudentID    string    `json:"student_id"`
	RegisteredAt time.Time `json:"registered_at"`
	Status       string    `json:"status"` // confirmed, cancelled
	Event        *Event    `json:"event,omitempty"`
}

type ParticipantDetail struct {
	RegistrationID string    `json:"registration_id"`
	RegisteredAt   time.Time `json:"registered_at"`
	Status         string    `json:"status"`
	UserID         string    `json:"user_id"`
	FullName       string    `json:"full_name"`
	Email          string    `json:"email"`
	CollegeName    string    `json:"college_name"`
	StudentID      string    `json:"student_id"`
	Department     string    `json:"department"`
	YearOfStudy    string    `json:"year_of_study"`
	DateOfBirth    *string   `json:"date_of_birth,omitempty"`
	Age            *int      `json:"age,omitempty"`
	Gender         *string   `json:"gender,omitempty"`
	PhoneNumber    *string   `json:"phone_number,omitempty"`
}

type TeacherDashboardStats struct {
	TotalEventsCreated int `json:"total_events_created"`
	ActiveEvents       int `json:"active_events"`
	TotalRegistrations int `json:"total_registrations"`
	UpcomingEvents     int `json:"upcoming_events"`
	CompletedEvents    int `json:"completed_events"`
}

type LabelCount struct {
	Label string `json:"label"`
	Count int    `json:"count"`
}

type DateCount struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

type EventStatistics struct {
	EventID            string       `json:"event_id"`
	EventTitle         string       `json:"event_title"`
	TotalRegistrations int          `json:"total_registrations"`
	MaxParticipants    int          `json:"max_participants"`
	CapacityPercentage float64      `json:"capacity_percentage"`
	ByDepartment       []LabelCount `json:"by_department"`
	ByYear             []LabelCount `json:"by_year"`
	ByGender           []LabelCount `json:"by_gender"`
	ByAgeGroup         []LabelCount `json:"by_age_group"`
	OverTime           []DateCount  `json:"over_time"`
}

