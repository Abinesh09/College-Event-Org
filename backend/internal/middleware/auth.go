package middleware

import (
	"strings"

	"campusconnect/internal/utils"
	"github.com/gofiber/fiber/v2"
)

func AuthRequired(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		var tokenStr string

		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			tokenStr = c.Cookies("jwt")
		}

		if tokenStr == "" {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Authentication required. Please log in.")
		}

		claims, err := utils.ValidateToken(tokenStr, jwtSecret)
		if err != nil {
			return utils.JSONError(c, fiber.StatusUnauthorized, "Invalid or expired session token")
		}

		c.Locals("userID", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("role", claims.Role)

		return c.Next()
	}
}

func RequireRole(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, ok := c.Locals("role").(string)
		if !ok || userRole == "" {
			return utils.JSONError(c, fiber.StatusForbidden, "Access forbidden: role not identified")
		}

		for _, role := range allowedRoles {
			if strings.EqualFold(userRole, role) {
				return c.Next()
			}
		}

		return utils.JSONError(c, fiber.StatusForbidden, "Access denied: your account role does not have permission for this resource")
	}
}

func OptionalAuth(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		var tokenStr string

		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			tokenStr = c.Cookies("jwt")
		}

		if tokenStr != "" {
			if claims, err := utils.ValidateToken(tokenStr, jwtSecret); err == nil {
				c.Locals("userID", claims.UserID)
				c.Locals("email", claims.Email)
				c.Locals("role", claims.Role)
			}
		}

		return c.Next()
	}
}
