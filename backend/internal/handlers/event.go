package handlers

import (
	"context"
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

type EventInput struct {
	Title                string `json:"title"`
	ShortDescription     string `json:"short_description"`
	Description          string `json:"description"`
	Category             string `json:"category"`
	EventType            string `json:"event_type"`
	EventDate            string `json:"event_date"` // YYYY-MM-DD
	StartTime            string `json:"start_time"`
	EndTime              string `json:"end_time"`
	Venue                string `json:"venue"`
	OrganizingDepartment string `json:"organizing_department"`
	RegistrationOpenAt   string `json:"registration_open_at"`   // RFC3339 or ISO
	RegistrationDeadline string `json:"registration_deadline"`  // RFC3339 or ISO
	MaxParticipants      int    `json:"max_participants"`
	EligibilityCriteria  string `json:"eligibility_criteria"`
	PosterURL            string `json:"poster_url"`
	ContactInfo          string `json:"contact_info"`
	Status               string `json:"status"` // draft, published, cancelled, completed
}

func ComputeEventStatus(status string, eventDateStr, endTimeStr string, openAt, deadline time.Time, currentRegs, maxParticipants int) string {
	if status == "draft" {
		return "Draft"
	}
	if status == "cancelled" {
		return "Cancelled"
	}
	if status == "completed" {
		return "Completed"
	}

	now := time.Now()

	// Check if event date has passed
	if eventDate, err := time.Parse("2006-01-02", eventDateStr); err == nil {
		// If event is strictly in past days
		if now.After(eventDate.Add(24 * time.Hour)) {
			return "Completed"
		}
	}

	if currentRegs >= maxParticipants && maxParticipants > 0 {
		return "Full"
	}
	if now.Before(openAt) {
		return "Upcoming"
	}
	if now.After(deadline) {
		return "Registration Closed"
	}

	return "Registration Open"
}

func ListEvents() fiber.Handler {
	return func(c *fiber.Ctx) error {
		search := strings.TrimSpace(c.Query("search", ""))
		category := strings.TrimSpace(c.Query("category", ""))
		eventType := strings.TrimSpace(c.Query("event_type", ""))
		department := strings.TrimSpace(c.Query("department", ""))
		statusFilter := strings.TrimSpace(c.Query("status", ""))
		page, _ := strconv.Atoi(c.Query("page", "1"))
		if page < 1 {
			page = 1
		}
		limit, _ := strconv.Atoi(c.Query("limit", "12"))
		if limit < 1 || limit > 100 {
			limit = 12
		}
		offset := (page - 1) * limit

		studentID, _ := c.Locals("userID").(string)
		userRole, _ := c.Locals("role").(string)

		ctx := context.Background()

		// Building dynamic query
		whereClauses := []string{"1=1"}
		args := []interface{}{}
		argIdx := 1

		// Teachers can see their own drafts in teacher views, but public list only shows published unless teacher requests
		if userRole != "teacher" {
			whereClauses = append(whereClauses, "e.status != 'draft'")
		}

		if search != "" {
			whereClauses = append(whereClauses, fmt.Sprintf("(LOWER(e.title) LIKE LOWER($%d) OR LOWER(e.short_description) LIKE LOWER($%d) OR LOWER(e.venue) LIKE LOWER($%d) OR LOWER(e.organizing_department) LIKE LOWER($%d))", argIdx, argIdx, argIdx, argIdx))
			args = append(args, "%"+search+"%")
			argIdx++
		}
		if category != "" && category != "All" {
			whereClauses = append(whereClauses, fmt.Sprintf("e.category = $%d", argIdx))
			args = append(args, category)
			argIdx++
		}
		if eventType != "" && eventType != "All" {
			whereClauses = append(whereClauses, fmt.Sprintf("e.event_type = $%d", argIdx))
			args = append(args, eventType)
			argIdx++
		}
		if department != "" && department != "All" {
			whereClauses = append(whereClauses, fmt.Sprintf("e.organizing_department = $%d", argIdx))
			args = append(args, department)
			argIdx++
		}

		whereStr := strings.Join(whereClauses, " AND ")

		// Count total items
		countQuery := fmt.Sprintf("SELECT COUNT(*) FROM events e WHERE %s", whereStr)
		var totalItems int
		err := database.Pool.QueryRow(ctx, countQuery, args...).Scan(&totalItems)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to count events", err.Error())
		}

		query := fmt.Sprintf(`
			SELECT 
				e.id, e.organizer_id, u.full_name as organizer_name, e.title, e.short_description,
				e.description, e.category, e.event_type, TO_CHAR(e.event_date, 'YYYY-MM-DD') as event_date,
				e.start_time, e.end_time, e.venue, e.organizing_department,
				e.registration_open_at, e.registration_deadline, e.max_participants,
				COALESCE(e.eligibility_criteria, ''), COALESCE(e.poster_url, ''), COALESCE(e.contact_info, ''),
				e.status, e.created_at, e.updated_at,
				(SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = e.id AND r.status = 'confirmed') as current_registrations,
				CASE WHEN $%d = '' THEN FALSE ELSE COALESCE((SELECT TRUE FROM event_registrations r WHERE r.event_id = e.id AND r.student_id = NULLIF($%d, '')::uuid AND r.status = 'confirmed'), FALSE) END as is_registered
			FROM events e
			JOIN users u ON e.organizer_id = u.id
			WHERE %s
			ORDER BY e.event_date ASC, e.created_at DESC
			LIMIT $%d OFFSET $%d
		`, argIdx, argIdx, whereStr, argIdx+1, argIdx+2)

		queryArgs := append(args, studentID, limit, offset)
		rows, err := database.Pool.Query(ctx, query, queryArgs...)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to retrieve events", err.Error())
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
				&ev.CurrentRegistrations, &ev.IsRegistered,
			)
			if err != nil {
				return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to read event row", err.Error())
			}

			ev.ComputedStatus = ComputeEventStatus(ev.Status, ev.EventDate, ev.EndTime, ev.RegistrationOpenAt, ev.RegistrationDeadline, ev.CurrentRegistrations, ev.MaxParticipants)
			ev.AvailableSeats = ev.MaxParticipants - ev.CurrentRegistrations
			if ev.AvailableSeats < 0 {
				ev.AvailableSeats = 0
			}

			// Filter by computed status if requested
			if statusFilter != "" && statusFilter != "All" {
				if !strings.EqualFold(ev.ComputedStatus, statusFilter) {
					continue
				}
			}

			events = append(events, ev)
		}

		return utils.JSONPagination(c, fiber.StatusOK, "Events retrieved", events, page, limit, totalItems)
	}
}

func GetEvent() fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		studentID, _ := c.Locals("userID").(string)
		ctx := context.Background()

		query := `
			SELECT 
				e.id, e.organizer_id, u.full_name as organizer_name, e.title, e.short_description,
				e.description, e.category, e.event_type, TO_CHAR(e.event_date, 'YYYY-MM-DD') as event_date,
				e.start_time, e.end_time, e.venue, e.organizing_department,
				e.registration_open_at, e.registration_deadline, e.max_participants,
				COALESCE(e.eligibility_criteria, ''), COALESCE(e.poster_url, ''), COALESCE(e.contact_info, ''),
				e.status, e.created_at, e.updated_at,
				(SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = e.id AND r.status = 'confirmed') as current_registrations,
				CASE WHEN $2 = '' THEN FALSE ELSE COALESCE((SELECT TRUE FROM event_registrations r WHERE r.event_id = e.id AND r.student_id = NULLIF($2, '')::uuid AND r.status = 'confirmed'), FALSE) END as is_registered
			FROM events e
			JOIN users u ON e.organizer_id = u.id
			WHERE e.id = $1
		`

		var ev models.Event
		err := database.Pool.QueryRow(ctx, query, id, studentID).Scan(
			&ev.ID, &ev.OrganizerID, &ev.OrganizerName, &ev.Title, &ev.ShortDescription,
			&ev.Description, &ev.Category, &ev.EventType, &ev.EventDate,
			&ev.StartTime, &ev.EndTime, &ev.Venue, &ev.OrganizingDepartment,
			&ev.RegistrationOpenAt, &ev.RegistrationDeadline, &ev.MaxParticipants,
			&ev.EligibilityCriteria, &ev.PosterURL, &ev.ContactInfo,
			&ev.Status, &ev.CreatedAt, &ev.UpdatedAt,
			&ev.CurrentRegistrations, &ev.IsRegistered,
		)
		if err != nil {
			if err == pgx.ErrNoRows {
				return utils.JSONError(c, fiber.StatusNotFound, "Event not found")
			}
			return utils.JSONError(c, fiber.StatusInternalServerError, "Database error retrieving event", err.Error())
		}

		ev.ComputedStatus = ComputeEventStatus(ev.Status, ev.EventDate, ev.EndTime, ev.RegistrationOpenAt, ev.RegistrationDeadline, ev.CurrentRegistrations, ev.MaxParticipants)
		ev.AvailableSeats = ev.MaxParticipants - ev.CurrentRegistrations
		if ev.AvailableSeats < 0 {
			ev.AvailableSeats = 0
		}

		return utils.JSONSuccess(c, fiber.StatusOK, "Event retrieved", ev)
	}
}

func CreateEvent() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, ok := c.Locals("userID").(string)
		if !ok || userID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Organizer authentication required")
		}

		var req EventInput
		if err := c.BodyParser(&req); err != nil {
			return utils.JSONError(c, fiber.StatusBadRequest, "Invalid event data format")
		}

		// Validation
		req.Title = strings.TrimSpace(req.Title)
		req.ShortDescription = strings.TrimSpace(req.ShortDescription)
		req.Description = strings.TrimSpace(req.Description)
		req.Category = strings.TrimSpace(req.Category)
		req.EventType = strings.TrimSpace(req.EventType)
		req.Venue = strings.TrimSpace(req.Venue)
		req.OrganizingDepartment = strings.TrimSpace(req.OrganizingDepartment)

		if req.Title == "" || req.ShortDescription == "" || req.Description == "" || req.Venue == "" || req.OrganizingDepartment == "" {
			return utils.JSONError(c, fiber.StatusBadRequest, "Title, descriptions, venue, and organizing department are required")
		}
		if req.EventDate == "" || req.StartTime == "" || req.EndTime == "" {
			return utils.JSONError(c, fiber.StatusBadRequest, "Event date, start time, and end time are required")
		}
		if req.MaxParticipants <= 0 {
			req.MaxParticipants = 50
		}
		if req.Status == "" {
			req.Status = "published"
		}

		openAt, err := parseDateTime(req.RegistrationOpenAt, time.Now())
		if err != nil {
			return utils.JSONError(c, fiber.StatusBadRequest, "Invalid registration opening date/time format")
		}

		deadline, err := parseDateTime(req.RegistrationDeadline, time.Now().AddDate(0, 0, 7))
		if err != nil {
			return utils.JSONError(c, fiber.StatusBadRequest, "Invalid registration deadline date/time format")
		}

		if deadline.Before(openAt) {
			return utils.JSONError(c, fiber.StatusBadRequest, "Registration deadline cannot be earlier than opening date")
		}

		ctx := context.Background()
		var eventID string
		err = database.Pool.QueryRow(ctx, `
			INSERT INTO events (
				organizer_id, title, short_description, description, category, event_type,
				event_date, start_time, end_time, venue, organizing_department,
				registration_open_at, registration_deadline, max_participants,
				eligibility_criteria, poster_url, contact_info, status
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
			) RETURNING id
		`, userID, req.Title, req.ShortDescription, req.Description, req.Category, req.EventType,
			req.EventDate, req.StartTime, req.EndTime, req.Venue, req.OrganizingDepartment,
			openAt, deadline, req.MaxParticipants, req.EligibilityCriteria, req.PosterURL, req.ContactInfo, req.Status,
		).Scan(&eventID)

		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to create event", err.Error())
		}

		return utils.JSONSuccess(c, fiber.StatusCreated, "Event created successfully", fiber.Map{
			"id": eventID,
		})
	}
}

func UpdateEvent() fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		userID, ok := c.Locals("userID").(string)
		if !ok || userID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Organizer authentication required")
		}

		ctx := context.Background()

		// Verify event ownership
		var organizerID string
		err := database.Pool.QueryRow(ctx, "SELECT organizer_id FROM events WHERE id = $1", id).Scan(&organizerID)
		if err != nil {
			if err == pgx.ErrNoRows {
				return utils.JSONError(c, fiber.StatusNotFound, "Event not found")
			}
			return utils.JSONError(c, fiber.StatusInternalServerError, "Database error", err.Error())
		}
		if organizerID != userID {
			return utils.JSONError(c, fiber.StatusForbidden, "Access denied: you can only update events you created")
		}

		var req EventInput
		if err := c.BodyParser(&req); err != nil {
			return utils.JSONError(c, fiber.StatusBadRequest, "Invalid update payload")
		}

		openAt, _ := parseDateTime(req.RegistrationOpenAt, time.Now())
		deadline, _ := parseDateTime(req.RegistrationDeadline, time.Now().AddDate(0, 0, 7))

		_, err = database.Pool.Exec(ctx, `
			UPDATE events SET
				title = COALESCE(NULLIF($1, ''), title),
				short_description = COALESCE(NULLIF($2, ''), short_description),
				description = COALESCE(NULLIF($3, ''), description),
				category = COALESCE(NULLIF($4, ''), category),
				event_type = COALESCE(NULLIF($5, ''), event_type),
				event_date = COALESCE(NULLIF($6, '')::DATE, event_date),
				start_time = COALESCE(NULLIF($7, ''), start_time),
				end_time = COALESCE(NULLIF($8, ''), end_time),
				venue = COALESCE(NULLIF($9, ''), venue),
				organizing_department = COALESCE(NULLIF($10, ''), organizing_department),
				registration_open_at = $11,
				registration_deadline = $12,
				max_participants = CASE WHEN $13 > 0 THEN $13 ELSE max_participants END,
				eligibility_criteria = $14,
				poster_url = $15,
				contact_info = $16,
				status = COALESCE(NULLIF($17, ''), status),
				updated_at = NOW()
			WHERE id = $18
		`, req.Title, req.ShortDescription, req.Description, req.Category, req.EventType,
			req.EventDate, req.StartTime, req.EndTime, req.Venue, req.OrganizingDepartment,
			openAt, deadline, req.MaxParticipants, req.EligibilityCriteria, req.PosterURL, req.ContactInfo, req.Status, id)

		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to update event", err.Error())
		}

		return utils.JSONSuccess(c, fiber.StatusOK, "Event updated successfully", nil)
	}
}

func UpdateEventStatus() fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		userID, ok := c.Locals("userID").(string)
		if !ok || userID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Organizer authentication required")
		}

		var req struct {
			Status string `json:"status"` // draft, published, cancelled, completed
		}
		if err := c.BodyParser(&req); err != nil || req.Status == "" {
			return utils.JSONError(c, fiber.StatusBadRequest, "Status field is required")
		}

		ctx := context.Background()

		// Verify event ownership
		var organizerID string
		err := database.Pool.QueryRow(ctx, "SELECT organizer_id FROM events WHERE id = $1", id).Scan(&organizerID)
		if err != nil {
			if err == pgx.ErrNoRows {
				return utils.JSONError(c, fiber.StatusNotFound, "Event not found")
			}
			return utils.JSONError(c, fiber.StatusInternalServerError, "Database error", err.Error())
		}
		if organizerID != userID {
			return utils.JSONError(c, fiber.StatusForbidden, "Access denied: you can only change status of your own events")
		}

		_, err = database.Pool.Exec(ctx, "UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2", req.Status, id)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to update event status", err.Error())
		}

		return utils.JSONSuccess(c, fiber.StatusOK, "Event status updated", fiber.Map{
			"status": req.Status,
		})
	}
}

func DeleteEvent() fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		userID, ok := c.Locals("userID").(string)
		if !ok || userID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Organizer authentication required")
		}

		ctx := context.Background()

		// Verify event ownership
		var organizerID string
		err := database.Pool.QueryRow(ctx, "SELECT organizer_id FROM events WHERE id = $1", id).Scan(&organizerID)
		if err != nil {
			if err == pgx.ErrNoRows {
				return utils.JSONError(c, fiber.StatusNotFound, "Event not found")
			}
			return utils.JSONError(c, fiber.StatusInternalServerError, "Database error", err.Error())
		}
		if organizerID != userID {
			return utils.JSONError(c, fiber.StatusForbidden, "Access denied: you can only delete events you created")
		}

		// Delete event
		_, err = database.Pool.Exec(ctx, "DELETE FROM events WHERE id = $1", id)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to delete event", err.Error())
		}

		return utils.JSONSuccess(c, fiber.StatusOK, "Event deleted successfully", nil)
	}
}

func parseDateTime(val string, fallback time.Time) (time.Time, error) {
	if strings.TrimSpace(val) == "" {
		return fallback, nil
	}
	formats := []string{
		time.RFC3339,
		"2006-01-02T15:04:05",
		"2006-01-02T15:04",
		"2006-01-02 15:04:05",
		"2006-01-02",
	}
	for _, fmtStr := range formats {
		if t, err := time.Parse(fmtStr, val); err == nil {
			return t, nil
		}
	}
	return fallback, fmt.Errorf("invalid date format: %s", val)
}

