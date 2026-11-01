package handlers

import (
	"context"
	"time"

	"campusconnect/internal/database"
	"campusconnect/internal/models"
	"campusconnect/internal/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"
)

func RegisterForEvent() fiber.Handler {
	return func(c *fiber.Ctx) error {
		eventID := c.Params("id")
		studentID, ok := c.Locals("userID").(string)
		if !ok || studentID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Student authentication required")
		}

		ctx := context.Background()

		// Start database transaction with row-level locking to prevent race conditions
		tx, err := database.Pool.Begin(ctx)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to initiate registration transaction")
		}
		defer tx.Rollback(ctx)

		// Acquire exclusive lock on the event row
		var status, eventDateStr, endTimeStr string
		var maxParticipants int
		var openAt, deadline time.Time

		err = tx.QueryRow(ctx, `
			SELECT status, TO_CHAR(event_date, 'YYYY-MM-DD'), end_time, registration_open_at, registration_deadline, max_participants
			FROM events
			WHERE id = $1
			FOR UPDATE
		`, eventID).Scan(&status, &eventDateStr, &endTimeStr, &openAt, &deadline, &maxParticipants)

		if err != nil {
			if err == pgx.ErrNoRows {
				return utils.JSONError(c, fiber.StatusNotFound, "Event not found")
			}
			return utils.JSONError(c, fiber.StatusInternalServerError, "Database error acquiring event lock", err.Error())
		}

		now := time.Now()

		if status != "published" {
			return utils.JSONError(c, fiber.StatusBadRequest, "Event is not currently accepting public registrations")
		}
		if now.Before(openAt) {
			return utils.JSONError(c, fiber.StatusBadRequest, "Registration for this event has not opened yet")
		}
		if now.After(deadline) {
			return utils.JSONError(c, fiber.StatusBadRequest, "Registration deadline for this event has passed")
		}

		// Check existing registration
		var existingStatus string
		err = tx.QueryRow(ctx, `
			SELECT status FROM event_registrations
			WHERE event_id = $1 AND student_id = $2
		`, eventID, studentID).Scan(&existingStatus)

		if err == nil && existingStatus == "confirmed" {
			return utils.JSONError(c, fiber.StatusConflict, "You are already registered for this event")
		}

		// Count active confirmed registrations
		var currentConfirmed int
		err = tx.QueryRow(ctx, `
			SELECT COUNT(*) FROM event_registrations
			WHERE event_id = $1 AND status = 'confirmed'
		`, eventID).Scan(&currentConfirmed)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to evaluate current registrations")
		}

		if currentConfirmed >= maxParticipants && maxParticipants > 0 {
			return utils.JSONError(c, fiber.StatusConflict, "Event capacity reached. No more seats available.")
		}

		// Insert or Reactivate registration
		if err == nil && existingStatus == "cancelled" {
			_, err = tx.Exec(ctx, `
				UPDATE event_registrations
				SET status = 'confirmed', registered_at = NOW()
				WHERE event_id = $1 AND student_id = $2
			`, eventID, studentID)
		} else {
			_, err = tx.Exec(ctx, `
				INSERT INTO event_registrations (event_id, student_id, status)
				VALUES ($1, $2, 'confirmed')
			`, eventID, studentID)
		}

		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to save registration", err.Error())
		}

		if err := tx.Commit(ctx); err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Transaction commit failed")
		}

		return utils.JSONSuccess(c, fiber.StatusOK, "Successfully registered for the event!", fiber.Map{
			"event_id":   eventID,
			"student_id": studentID,
			"status":     "confirmed",
		})
	}
}

func CancelRegistration() fiber.Handler {
	return func(c *fiber.Ctx) error {
		eventID := c.Params("id")
		studentID, ok := c.Locals("userID").(string)
		if !ok || studentID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Student authentication required")
		}

		ctx := context.Background()

		// Check if event is already completed
		var eventDateStr string
		err := database.Pool.QueryRow(ctx, "SELECT TO_CHAR(event_date, 'YYYY-MM-DD') FROM events WHERE id = $1", eventID).Scan(&eventDateStr)
		if err != nil {
			return utils.JSONError(c, fiber.StatusNotFound, "Event not found")
		}

		if eventDate, err := time.Parse("2006-01-02", eventDateStr); err == nil {
			if time.Now().After(eventDate) {
				return utils.JSONError(c, fiber.StatusBadRequest, "Cannot cancel registration for an event that has already occurred")
			}
		}

		res, err := database.Pool.Exec(ctx, `
			UPDATE event_registrations
			SET status = 'cancelled'
			WHERE event_id = $1 AND student_id = $2 AND status = 'confirmed'
		`, eventID, studentID)

		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Database error during cancellation", err.Error())
		}
		if res.RowsAffected() == 0 {
			return utils.JSONError(c, fiber.StatusNotFound, "No active registration found for this event")
		}

		return utils.JSONSuccess(c, fiber.StatusOK, "Registration successfully cancelled", nil)
	}
}

func GetMyRegistrations() fiber.Handler {
	return func(c *fiber.Ctx) error {
		studentID, ok := c.Locals("userID").(string)
		if !ok || studentID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Student authentication required")
		}

		ctx := context.Background()

		query := `
			SELECT 
				r.id, r.event_id, r.student_id, r.registered_at, r.status,
				e.id, e.organizer_id, u.full_name as organizer_name, e.title, e.short_description,
				e.description, e.category, e.event_type, TO_CHAR(e.event_date, 'YYYY-MM-DD') as event_date,
				e.start_time, e.end_time, e.venue, e.organizing_department,
				e.registration_open_at, e.registration_deadline, e.max_participants,
				COALESCE(e.eligibility_criteria, ''), COALESCE(e.poster_url, ''), COALESCE(e.contact_info, ''),
				e.status as event_status, e.created_at, e.updated_at,
				(SELECT COUNT(*) FROM event_registrations cr WHERE cr.event_id = e.id AND cr.status = 'confirmed') as current_registrations
			FROM event_registrations r
			JOIN events e ON r.event_id = e.id
			JOIN users u ON e.organizer_id = u.id
			WHERE r.student_id = $1
			ORDER BY r.registered_at DESC
		`

		rows, err := database.Pool.Query(ctx, query, studentID)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to load registrations", err.Error())
		}
		defer rows.Close()

		registrations := []models.EventRegistration{}
		for rows.Next() {
			var reg models.EventRegistration
			var ev models.Event
			var dummyStudentID string
			err := rows.Scan(
				&reg.ID, &reg.EventID, &dummyStudentID, &reg.RegisteredAt, &reg.Status,
				&ev.ID, &ev.OrganizerID, &ev.OrganizerName, &ev.Title, &ev.ShortDescription,
				&ev.Description, &ev.Category, &ev.EventType, &ev.EventDate,
				&ev.StartTime, &ev.EndTime, &ev.Venue, &ev.OrganizingDepartment,
				&ev.RegistrationOpenAt, &ev.RegistrationDeadline, &ev.MaxParticipants,
				&ev.EligibilityCriteria, &ev.PosterURL, &ev.ContactInfo,
				&ev.Status, &ev.CreatedAt, &ev.UpdatedAt,
				&ev.CurrentRegistrations,
			)
			if err != nil {
				return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to scan registration row", err.Error())
			}

			ev.ComputedStatus = ComputeEventStatus(ev.Status, ev.EventDate, ev.EndTime, ev.RegistrationOpenAt, ev.RegistrationDeadline, ev.CurrentRegistrations, ev.MaxParticipants)
			ev.AvailableSeats = ev.MaxParticipants - ev.CurrentRegistrations
			if ev.AvailableSeats < 0 {
				ev.AvailableSeats = 0
			}
			ev.IsRegistered = reg.Status == "confirmed"

			reg.StudentID = studentID
			reg.Event = &ev
			registrations = append(registrations, reg)
		}

		return utils.JSONSuccess(c, fiber.StatusOK, "Registrations retrieved", registrations)
	}
}
