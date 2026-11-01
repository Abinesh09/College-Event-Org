package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort     string
	DatabaseURL    string
	JWTSecret      string
	JWTExpiryHours int
	UploadDir      string
	AllowOrigins   string
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	port := getEnv("PORT", "8080")
	dbURL := getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/campusconnect?sslmode=disable")
	jwtSecret := getEnv("JWT_SECRET", "supersecret_jwt_key_campusconnect_2026")
	uploadDir := getEnv("UPLOAD_DIR", "./uploads")
	allowOrigins := getEnv("ALLOW_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:80,http://127.0.0.1:5173")

	expiryHours := 24
	if ehStr := os.Getenv("JWT_EXPIRY_HOURS"); ehStr != "" {
		if val, err := strconv.Atoi(ehStr); err == nil && val > 0 {
			expiryHours = val
		}
	}

	return &Config{
		ServerPort:     port,
		DatabaseURL:    dbURL,
		JWTSecret:      jwtSecret,
		JWTExpiryHours: expiryHours,
		UploadDir:      uploadDir,
		AllowOrigins:   allowOrigins,
	}
}

func getEnv(key, defaultVal string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	return val
}
