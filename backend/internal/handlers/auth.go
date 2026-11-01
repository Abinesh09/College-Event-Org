package handlers

import (
	"context"
	"strings"
	"time"

	"campusconnect/internal/config"
	"campusconnect/internal/database"
	"campusconnect/internal/models"
	"campusconnect/internal/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"
)

type StudentRegisterRequest struct {
	FullName        string  `json:"full_name"`
	Email           string  `json:"email"`
	Password        string  `json:"password"`
	ConfirmPassword string  `json:"confirm_password"`
	CollegeName     string  `json:"college_name"`
	StudentID       string  `json:"student_id"`
	Department      string  `json:"department"`
	YearOfStudy     string  `json:"year_of_study"`
	DateOfBirth     *string `json:"date_of_birth"`
	Age             *int    `json:"age"`
	Gender          *string `json:"gender"`
	PhoneNumber     *string `json:"phone_number"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func RegisterStudent(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req StudentRegisterRequest
		if err := c.BodyParser(&req); err != nil {
			return utils.JSONError(c, fiber.StatusBadRequest, "Invalid request payload format")
		}

		// Validation
		req.FullName = strings.TrimSpace(req.FullName)
		req.Email = strings.ToLower(strings.TrimSpace(req.Email))
		req.CollegeName = strings.TrimSpace(req.CollegeName)
		req.StudentID = strings.TrimSpace(req.StudentID)
		req.Department = strings.TrimSpace(req.Department)
		req.YearOfStudy = strings.TrimSpace(req.YearOfStudy)

		if req.FullName == "" || req.Email == "" || req.Password == "" {
			return utils.JSONError(c, fiber.StatusBadRequest, "Full name, email, and password are required")
		}
		if len(req.Password) < 6 {
			return utils.JSONError(c, fiber.StatusBadRequest, "Password must be at least 6 characters long")
		}
		if req.Password != req.ConfirmPassword {
			return utils.JSONError(c, fiber.StatusBadRequest, "Passwords do not match")
		}
		if req.CollegeName == "" || req.StudentID == "" || req.Department == "" || req.YearOfStudy == "" {
			return utils.JSONError(c, fiber.StatusBadRequest, "College name, student ID, department, and year of study are required")
		}

		ctx := context.Background()

		// Check if email already registered
		var exists bool
		err := database.Pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(email) = LOWER($1))", req.Email).Scan(&exists)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Database error verifying email", err.Error())
		}
		if exists {
			return utils.JSONError(c, fiber.StatusConflict, "An account with this email address already exists")
		}

		hashedPassword, err := utils.HashPassword(req.Password)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to hash password")
		}

		// Use database transaction
		tx, err := database.Pool.Begin(ctx)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to start database transaction")
		}
		defer tx.Rollback(ctx)

		var userID string
		err = tx.QueryRow(ctx, `
			INSERT INTO users (full_name, email, password_hash, role)
			VALUES ($1, $2, $3, 'student')
			RETURNING id
		`, req.FullName, req.Email, hashedPassword).Scan(&userID)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to create user account", err.Error())
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO student_profiles (user_id, college_name, student_id, department, year_of_study, date_of_birth, age, gender, phone_number)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, userID, req.CollegeName, req.StudentID, req.Department, req.YearOfStudy, req.DateOfBirth, req.Age, req.Gender, req.PhoneNumber)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to create student profile", err.Error())
		}

		if err := tx.Commit(ctx); err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to finalize account creation")
		}

		// Generate JWT token
		token, err := utils.GenerateToken(userID, req.Email, "student", cfg.JWTSecret, cfg.JWTExpiryHours)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to generate authorization token")
		}

		c.Cookie(&fiber.Cookie{
			Name:     "jwt",
			Value:    token,
			Expires:  time.Now().Add(time.Duration(cfg.JWTExpiryHours) * time.Hour),
			HTTPOnly: true,
			SameSite: "Lax",
		})

		user := models.User{
			ID:       userID,
			FullName: req.FullName,
			Email:    req.Email,
			Role:     "student",
			Profile: &models.StudentProfile{
				UserID:      userID,
				CollegeName: req.CollegeName,
				StudentID:   req.StudentID,
				Department:  req.Department,
				YearOfStudy: req.YearOfStudy,
				DateOfBirth: req.DateOfBirth,
				Age:         req.Age,
				Gender:      req.Gender,
				PhoneNumber: req.PhoneNumber,
			},
		}

		return utils.JSONSuccess(c, fiber.StatusCreated, "Registration successful", fiber.Map{
			"user":  user,
			"token": token,
		})
	}
}

func Login(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req LoginRequest
		if err := c.BodyParser(&req); err != nil {
			return utils.JSONError(c, fiber.StatusBadRequest, "Invalid login credentials format")
		}

		req.Email = strings.ToLower(strings.TrimSpace(req.Email))
		if req.Email == "" || req.Password == "" {
			return utils.JSONError(c, fiber.StatusBadRequest, "Email and password are required")
		}

		ctx := context.Background()

		var user models.User
		err := database.Pool.QueryRow(ctx, `
			SELECT id, full_name, email, password_hash, role, created_at, updated_at
			FROM users
			WHERE LOWER(email) = LOWER($1)
		`, req.Email).Scan(&user.ID, &user.FullName, &user.Email, &user.PasswordHash, &user.Role, &user.CreatedAt, &user.UpdatedAt)

		if err != nil {
			if err == pgx.ErrNoRows {
				return utils.JSONError(c, fiber.StatusUnauthorized, "Invalid email or password")
			}
			return utils.JSONError(c, fiber.StatusInternalServerError, "Database error during login", err.Error())
		}

		if !utils.CheckPassword(user.PasswordHash, req.Password) {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Invalid email or password")
		}

		// If student, load profile
		if user.Role == "student" {
			var prof models.StudentProfile
			prof.UserID = user.ID
			var dob *time.Time
			err = database.Pool.QueryRow(ctx, `
				SELECT college_name, student_id, department, year_of_study, date_of_birth, age, gender, phone_number
				FROM student_profiles
				WHERE user_id = $1
			`, user.ID).Scan(&prof.CollegeName, &prof.StudentID, &prof.Department, &prof.YearOfStudy, &dob, &prof.Age, &prof.Gender, &prof.PhoneNumber)
			if err == nil {
				if dob != nil {
					dStr := dob.Format("2006-01-02")
					prof.DateOfBirth = &dStr
				}
				user.Profile = &prof
			}
		}

		token, err := utils.GenerateToken(user.ID, user.Email, user.Role, cfg.JWTSecret, cfg.JWTExpiryHours)
		if err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to issue session token")
		}

		c.Cookie(&fiber.Cookie{
			Name:     "jwt",
			Value:    token,
			Expires:  time.Now().Add(time.Duration(cfg.JWTExpiryHours) * time.Hour),
			HTTPOnly: true,
			SameSite: "Lax",
		})

		return utils.JSONSuccess(c, fiber.StatusOK, "Login successful", fiber.Map{
			"user":  user,
			"token": token,
		})
	}
}

func Logout() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Cookie(&fiber.Cookie{
			Name:     "jwt",
			Value:    "",
			Expires:  time.Now().Add(-1 * time.Hour),
			HTTPOnly: true,
			SameSite: "Lax",
		})
		return utils.JSONSuccess(c, fiber.StatusOK, "Logged out successfully", nil)
	}
}

func GetMe() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, ok := c.Locals("userID").(string)
		if !ok || userID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "User session not found")
		}

		ctx := context.Background()
		var user models.User
		err := database.Pool.QueryRow(ctx, `
			SELECT id, full_name, email, role, created_at, updated_at
			FROM users
			WHERE id = $1
		`, userID).Scan(&user.ID, &user.FullName, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return utils.JSONError(c, fiber.StatusNotFound, "User not found")
		}

		if user.Role == "student" {
			var prof models.StudentProfile
			prof.UserID = user.ID
			var dob *time.Time
			err = database.Pool.QueryRow(ctx, `
				SELECT college_name, student_id, department, year_of_study, date_of_birth, age, gender, phone_number
				FROM student_profiles
				WHERE user_id = $1
			`, user.ID).Scan(&prof.CollegeName, &prof.StudentID, &prof.Department, &prof.YearOfStudy, &dob, &prof.Age, &prof.Gender, &prof.PhoneNumber)
			if err == nil {
				if dob != nil {
					dStr := dob.Format("2006-01-02")
					prof.DateOfBirth = &dStr
				}
				user.Profile = &prof
			}
		}

		return utils.JSONSuccess(c, fiber.StatusOK, "Current user retrieved", user)
	}
}

func UpdateProfile() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, ok := c.Locals("userID").(string)
		if !ok || userID == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "User session not found")
		}

		var req struct {
			FullName    string  `json:"full_name"`
			CollegeName string  `json:"college_name"`
			Department  string  `json:"department"`
			YearOfStudy string  `json:"year_of_study"`
			Age         *int    `json:"age"`
			Gender      *string `json:"gender"`
			PhoneNumber *string `json:"phone_number"`
		}

		if err := c.BodyParser(&req); err != nil {
			return utils.JSONError(c, fiber.StatusBadRequest, "Invalid update payload")
		}

		ctx := context.Background()

		if strings.TrimSpace(req.FullName) != "" {
			_, _ = database.Pool.Exec(ctx, "UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2", req.FullName, userID)
		}

		_, _ = database.Pool.Exec(ctx, `
			UPDATE student_profiles
			SET college_name = COALESCE(NULLIF($1, ''), college_name),
			    department = COALESCE(NULLIF($2, ''), department),
			    year_of_study = COALESCE(NULLIF($3, ''), year_of_study),
			    age = COALESCE($4, age),
			    gender = COALESCE($5, gender),
			    phone_number = COALESCE($6, phone_number)
			WHERE user_id = $7
		`, req.CollegeName, req.Department, req.YearOfStudy, req.Age, req.Gender, req.PhoneNumber, userID)

		return utils.JSONSuccess(c, fiber.StatusOK, "Profile updated successfully", nil)
	}
}
