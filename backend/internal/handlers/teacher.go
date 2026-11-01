package handlers

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"strconv"
	"strings"
	"time"

	"campusconnect/internal/database"
	"campusconnect/internal/models"
	"campusconnect/internal/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"
)

func verifyTeacherEventOwnership(ctx context.Context, eventID, teacherID string) (bool, error) {
	var organizerID string
	err := database.Pool.QueryRow(ctx, "SELECT organizer_id FROM events WHERE id = $1", eventID).Scan(&organizerID)
	if err != nil {
		return false, err
	}
	return organizerID == teacherID, nil
}

func GetTeacherDashboardStats() fiber.Handler {
	return func(c *fiber.Ctx) error {
		teacherID, ok := c.Locals("userID").(string)
		if !ok || teacherID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Teacher authentication required")
		}

		ctx := context.Background()

		var stats models.TeacherDashboardStats

		// Total events
		_ = database.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM events WHERE organizer_id = $1", teacherID).Scan(&stats.TotalEventsCreated)

		// Active events (published and date >= current_date)
		_ = database.Pool.QueryRow(ctx, `
			SELECT COUNT(*) FROM events 
			WHERE organizer_id = $1 AND status = 'published' AND event_date >= CURRENT_DATE
		`, teacherID).Scan(&stats.ActiveEvents)

		// Upcoming events (published, registration open in future or active)
		_ = database.Pool.QueryRow(ctx, `
			SELECT COUNT(*) FROM events 
			WHERE organizer_id = $1 AND status = 'published' AND event_date > CURRENT_DATE
		`, teacherID).Scan(&stats.UpcomingEvents)

		// Completed events
		_ = database.Pool.QueryRow(ctx, `
			SELECT COUNT(*) FROM events 
			WHERE organizer_id = $1 AND (status = 'completed' OR event_date < CURRENT_DATE)
		`, teacherID).Scan(&stats.CompletedEvents)

		// Total registrations across all events owned by this teacher
		_ = database.Pool.QueryRow(ctx, `
			SELECT COUNT(r.id) 
			FROM event_registrations r
			JOIN events e ON r.event_id = e.id
			WHERE e.organizer_id = $1 AND r.status = 'confirmed'
		`, teacherID).Scan(&stats.TotalRegistrations)

		return utils.JSONSuccess(c, fiber.StatusOK, "Teacher dashboard statistics retrieved", stats)
	}
}

func GetTeacherEvents() fiber.Handler {
	return func(c *fiber.Ctx) error {
		teacherID, ok := c.Locals("userID").(string)
		if !ok || teacherID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Teacher authentication required")
		}

		ctx := context.Background()

		query := `
			SELECT 
				e.id, e.organizer_id, u.full_name as organizer_name, e.title, e.short_description,
				e.description, e.category, e.event_type, TO_CHAR(e.event_date, 'YYYY-MM-DD') as event_date,
				e.start_time, e.end_time, e.venue, e.organizing_department,
				e.registration_open_at, e.registration_deadline, e.max_participants,
				COALESCE(e.eligibility_criteria, ''), COALESCE(e.poster_url, ''), COALESCE(e.contact_info, ''),
				e.status, e.created_at, e.updated_at,
				(SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = e.id AND r.status = 'confirmed') as current_registrations
			FROM events e
			JOIN users u ON e.organizer_id = u.id
			WHERE e.organizer_id = $1
			ORDER BY e.created_at DESC
		`

		rows, err := database.Pool.Query(ctx, query, teacherID)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to retrieve teacher events", err.Error())
		}
		defer rows.Close()

		events := []models.Event{}
		for rows.Next() {
			var ev models.Event
			err := rows.Scan(
				&ev.ID, &ev.OrganizerID, &ev.OrganizerName, &ev.Title, &ev.ShortDescription,
				&ev.Description, &ev.Category, &ev.EventType, &ev.EventDate,
				&ev.StartTime, &ev.EndTime, &ev.Venue, &ev.OrganizingDepartment,
				&ev.RegistrationOpenAt, &ev.RegistrationDeadline, &ev.MaxParticipants,
				&ev.EligibilityCriteria, &ev.PosterURL, &ev.ContactInfo,
				&ev.Status, &ev.CreatedAt, &ev.UpdatedAt,
				&ev.CurrentRegistrations,
			)
			if err != nil {
				return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to read event row", err.Error())
			}

			ev.ComputedStatus = ComputeEventStatus(ev.Status, ev.EventDate, ev.EndTime, ev.RegistrationOpenAt, ev.RegistrationDeadline, ev.CurrentRegistrations, ev.MaxParticipants)
			ev.AvailableSeats = ev.MaxParticipants - ev.CurrentRegistrations
			if ev.AvailableSeats < 0 {
				ev.AvailableSeats = 0
			}

			events = append(events, ev)
		}

		return utils.JSONSuccess(c, fiber.StatusOK, "Teacher events retrieved", events)
	}
}

func GetEventParticipants() fiber.Handler {
	return func(c *fiber.Ctx) error {
		eventID := c.Params("id")
		teacherID, ok := c.Locals("userID").(string)
		if !ok || teacherID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Teacher authentication required")
		}

		ctx := context.Background()

		// Verify event ownership
		isOwner, err := verifyTeacherEventOwnership(ctx, eventID, teacherID)
		if err != nil {
			if err == pgx.ErrNoRows {
				return utils.JSONError(c, fiber.StatusNotFound, "Event not found")
			}
			return utils.JSONError(c, fiber.StatusInternalServerError, "Database error", err.Error())
		}
		if !isOwner {
			return utils.JSONError(c, fiber.StatusForbidden, "Access denied: you can only view participants for your own events")
		}

		search := strings.TrimSpace(c.Query("search", ""))
		department := strings.TrimSpace(c.Query("department", ""))
		gender := strings.TrimSpace(c.Query("gender", ""))
		year := strings.TrimSpace(c.Query("year", ""))
		status := strings.TrimSpace(c.Query("status", ""))
		page, _ := strconv.Atoi(c.Query("page", "1"))
		if page < 1 {
			page = 1
		}
		limit, _ := strconv.Atoi(c.Query("limit", "15"))
		if limit < 1 || limit > 100 {
			limit = 15
		}
		offset := (page - 1) * limit

		whereClauses := []string{"r.event_id = $1"}
		args := []interface{}{eventID}
		argIdx := 2

		if search != "" {
			whereClauses = append(whereClauses, fmt.Sprintf("(LOWER(u.full_name) LIKE LOWER($%d) OR LOWER(u.email) LIKE LOWER($%d) OR LOWER(p.student_id) LIKE LOWER($%d))", argIdx, argIdx, argIdx))
			args = append(args, "%"+search+"%")
			argIdx++
		}
		if department != "" && department != "All" {
			whereClauses = append(whereClauses, fmt.Sprintf("p.department = $%d", argIdx))
			args = append(args, department)
			argIdx++
		}
		if gender != "" && gender != "All" {
			whereClauses = append(whereClauses, fmt.Sprintf("p.gender = $%d", argIdx))
			args = append(args, gender)
			argIdx++
		}
		if year != "" && year != "All" {
			whereClauses = append(whereClauses, fmt.Sprintf("p.year_of_study = $%d", argIdx))
			args = append(args, year)
			argIdx++
		}
		if status != "" && status != "All" {
			whereClauses = append(whereClauses, fmt.Sprintf("r.status = $%d", argIdx))
			args = append(args, status)
			argIdx++
		}

		whereStr := strings.Join(whereClauses, " AND ")

		// Total count
		countQuery := fmt.Sprintf(`
			SELECT COUNT(r.id)
			FROM event_registrations r
			JOIN users u ON r.student_id = u.id
			LEFT JOIN student_profiles p ON u.id = p.user_id
			WHERE %s
		`, whereStr)

		var totalCount int
		err = database.Pool.QueryRow(ctx, countQuery, args...).Scan(&totalCount)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to count participants", err.Error())
		}

		// Retrieve records
		query := fmt.Sprintf(`
			SELECT 
				r.id, r.registered_at, r.status, u.id, u.full_name, u.email,
				COALESCE(p.college_name, ''), COALESCE(p.student_id, ''),
				COALESCE(p.department, ''), COALESCE(p.year_of_study, ''),
				p.date_of_birth, p.age, p.gender, p.phone_number
			FROM event_registrations r
			JOIN users u ON r.student_id = u.id
			LEFT JOIN student_profiles p ON u.id = p.user_id
			WHERE %s
			ORDER BY r.registered_at DESC
			LIMIT $%d OFFSET $%d
		`, whereStr, argIdx, argIdx+1)

		args = append(args, limit, offset)
		rows, err := database.Pool.Query(ctx, query, args...)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to query participants", err.Error())
		}
		defer rows.Close()

		participants := []models.ParticipantDetail{}
		for rows.Next() {
			var p models.ParticipantDetail
			var dob *time.Time
			err := rows.Scan(
				&p.RegistrationID, &p.RegisteredAt, &p.Status, &p.UserID, &p.FullName, &p.Email,
				&p.CollegeName, &p.StudentID, &p.Department, &p.YearOfStudy,
				&dob, &p.Age, &p.Gender, &p.PhoneNumber,
			)
			if err != nil {
				return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to scan participant row", err.Error())
			}
			if dob != nil {
				dStr := dob.Format("2006-01-02")
				p.DateOfBirth = &dStr
			}
			participants = append(participants, p)
		}

		return utils.JSONPagination(c, fiber.StatusOK, "Participants retrieved", participants, page, limit, totalCount)
	}
}

func GetEventStatistics() fiber.Handler {
	return func(c *fiber.Ctx) error {
		eventID := c.Params("id")
		teacherID, ok := c.Locals("userID").(string)
		if !ok || teacherID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Teacher authentication required")
		}

		ctx := context.Background()

		// Verify event ownership
		var title string
		var maxParticipants int
		err := database.Pool.QueryRow(ctx, "SELECT title, max_participants FROM events WHERE id = $1 AND organizer_id = $2", eventID, teacherID).Scan(&title, &maxParticipants)
		if err != nil {
			if err == pgx.ErrNoRows {
				return utils.JSONError(c, fiber.StatusForbidden, "Access denied: you can only view statistics for your own events")
			}
			return utils.JSONError(c, fiber.StatusInternalServerError, "Database error", err.Error())
		}

		stats := models.EventStatistics{
			EventID:         eventID,
			EventTitle:      title,
			MaxParticipants: maxParticipants,
			ByDepartment:    []models.LabelCount{},
			ByYear:          []models.LabelCount{},
			ByGender:        []models.LabelCount{},
			ByAgeGroup:      []models.LabelCount{},
			OverTime:        []models.DateCount{},
		}

		// Total confirmed registrations
		_ = database.Pool.QueryRow(ctx, `
			SELECT COUNT(*) FROM event_registrations 
			WHERE event_id = $1 AND status = 'confirmed'
		`, eventID).Scan(&stats.TotalRegistrations)

		if maxParticipants > 0 {
			stats.CapacityPercentage = (float64(stats.TotalRegistrations) / float64(maxParticipants)) * 100
		}

		// By Department
		deptRows, err := database.Pool.Query(ctx, `
			SELECT COALESCE(NULLIF(p.department, ''), 'Unspecified') as dept, COUNT(r.id) as cnt
			FROM event_registrations r
			JOIN student_profiles p ON r.student_id = p.user_id
			WHERE r.event_id = $1 AND r.status = 'confirmed'
			GROUP BY dept
			ORDER BY cnt DESC
		`, eventID)
		if err == nil {
			defer deptRows.Close()
			for deptRows.Next() {
				var lc models.LabelCount
				if err := deptRows.Scan(&lc.Label, &lc.Count); err == nil {
					stats.ByDepartment = append(stats.ByDepartment, lc)
				}
			}
		}

		// By Year of Study
		yearRows, err := database.Pool.Query(ctx, `
			SELECT COALESCE(NULLIF(p.year_of_study, ''), 'Unspecified') as yr, COUNT(r.id) as cnt
			FROM event_registrations r
			JOIN student_profiles p ON r.student_id = p.user_id
			WHERE r.event_id = $1 AND r.status = 'confirmed'
			GROUP BY yr
			ORDER BY cnt DESC
		`, eventID)
		if err == nil {
			defer yearRows.Close()
			for yearRows.Next() {
				var lc models.LabelCount
				if err := yearRows.Scan(&lc.Label, &lc.Count); err == nil {
					stats.ByYear = append(stats.ByYear, lc)
				}
			}
		}

		// By Gender
		genderRows, err := database.Pool.Query(ctx, `
			SELECT COALESCE(NULLIF(p.gender, ''), 'Prefer not to say') as g, COUNT(r.id) as cnt
			FROM event_registrations r
			JOIN student_profiles p ON r.student_id = p.user_id
			WHERE r.event_id = $1 AND r.status = 'confirmed'
			GROUP BY g
			ORDER BY cnt DESC
		`, eventID)
		if err == nil {
			defer genderRows.Close()
			for genderRows.Next() {
				var lc models.LabelCount
				if err := genderRows.Scan(&lc.Label, &lc.Count); err == nil {
					stats.ByGender = append(stats.ByGender, lc)
				}
			}
		}

		// By Age Group
		ageRows, err := database.Pool.Query(ctx, `
			SELECT 
				CASE 
					WHEN p.age < 18 THEN 'Under 18'
					WHEN p.age BETWEEN 18 AND 20 THEN '18-20'
					WHEN p.age BETWEEN 21 AND 23 THEN '21-23'
					WHEN p.age >= 24 THEN '24+'
					ELSE 'Undisclosed'
				END as age_group,
				COUNT(r.id) as cnt
			FROM event_registrations r
			JOIN student_profiles p ON r.student_id = p.user_id
			WHERE r.event_id = $1 AND r.status = 'confirmed'
			GROUP BY age_group
			ORDER BY cnt DESC
		`, eventID)
		if err == nil {
			defer ageRows.Close()
			for ageRows.Next() {
				var lc models.LabelCount
				if err := ageRows.Scan(&lc.Label, &lc.Count); err == nil {
					stats.ByAgeGroup = append(stats.ByAgeGroup, lc)
				}
			}
		}

		// Over time (last 14 days)
		timeRows, err := database.Pool.Query(ctx, `
			SELECT TO_CHAR(r.registered_at, 'YYYY-MM-DD') as reg_date, COUNT(r.id) as cnt
			FROM event_registrations r
			WHERE r.event_id = $1 AND r.status = 'confirmed'
			GROUP BY reg_date
			ORDER BY reg_date ASC
		`, eventID)
		if err == nil {
			defer timeRows.Close()
			for timeRows.Next() {
				var dc models.DateCount
				if err := timeRows.Scan(&dc.Date, &dc.Count); err == nil {
					stats.OverTime = append(stats.OverTime, dc)
				}
			}
		}

		return utils.JSONSuccess(c, fiber.StatusOK, "Event statistics retrieved", stats)
	}
}

func ExportEventParticipantsCSV() fiber.Handler {
	return func(c *fiber.Ctx) error {
		eventID := c.Params("id")
		teacherID, ok := c.Locals("userID").(string)
		if !ok || teacherID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Teacher authentication required")
		}

		ctx := context.Background()

		// Verify event ownership
		var eventTitle string
		err := database.Pool.QueryRow(ctx, "SELECT title FROM events WHERE id = $1 AND organizer_id = $2", eventID, teacherID).Scan(&eventTitle)
		if err != nil {
			if err == pgx.ErrNoRows {
				return utils.JSONError(c, fiber.StatusForbidden, "Access denied: you can only export data for your own events")
			}
			return utils.JSONError(c, fiber.StatusInternalServerError, "Database error", err.Error())
		}

		query := `
			SELECT 
				r.id, u.full_name, u.email,
				COALESCE(p.college_name, ''), COALESCE(p.student_id, ''),
				COALESCE(p.department, ''), COALESCE(p.year_of_study, ''),
				COALESCE(p.age::TEXT, 'N/A'), COALESCE(p.gender, 'Prefer not to say'),
				COALESCE(p.phone_number, 'N/A'),
				TO_CHAR(r.registered_at, 'YYYY-MM-DD HH24:MI:SS'), r.status
			FROM event_registrations r
			JOIN users u ON r.student_id = u.id
			LEFT JOIN student_profiles p ON u.id = p.user_id
			WHERE r.event_id = $1
			ORDER BY r.registered_at ASC
		`

		rows, err := database.Pool.Query(ctx, query, eventID)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to query participant records for export", err.Error())
		}
		defer rows.Close()

		b := &bytes.Buffer{}
		writer := csv.NewWriter(b)

		// Header
		_ = writer.Write([]string{
			"Registration ID",
			"Student Full Name",
			"Email Address",
			"College Name",
			"Student ID / Roll No",
			"Department",
			"Year of Study",
			"Age",
			"Gender",
			"Phone Number",
			"Registration Timestamp",
			"Registration Status",
		})

		for rows.Next() {
			var regID, name, email, college, rollNo, dept, year, age, gender, phone, regTime, status string
			if err := rows.Scan(&regID, &name, &email, &college, &rollNo, &dept, &year, &age, &gender, &phone, &regTime, &status); err == nil {
				_ = writer.Write([]string{
					regID, name, email, college, rollNo, dept, year, age, gender, phone, regTime, status,
				})
			}
		}
		writer.Flush()

		cleanTitle := strings.ReplaceAll(eventTitle, " ", "_")
		cleanTitle = strings.ReplaceAll(cleanTitle, ":", "")
		fileName := fmt.Sprintf("registrations_%s_%s.csv", cleanTitle, time.Now().Format("20060102"))

		c.Set("Content-Type", "text/csv; charset=utf-8")
		c.Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, fileName))

		return c.Send(b.Bytes())
	}
}

