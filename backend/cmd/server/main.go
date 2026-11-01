package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"campusconnect/internal/config"
	"campusconnect/internal/database"
	"campusconnect/internal/handlers"
	"campusconnect/internal/middleware"
	"campusconnect/internal/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	cfg := config.LoadConfig()

	log.Printf("Connecting to PostgreSQL...")
	pool, err := database.ConnectDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Fatal: Database initialization error: %v", err)
	}
	defer database.CloseDB()

	// Apply schema migrations
	if err := database.RunMigrations(pool); err != nil {
		log.Fatalf("Fatal: Database migration error: %v", err)
	}

	// Seed demo accounts and events
	if err := database.SeedDatabase(pool); err != nil {
		log.Printf("Warning: Database seeding encountered issue: %v", err)
	}

	// Ensure upload directory exists
	_ = os.MkdirAll(cfg.UploadDir, 0755)

	app := fiber.New(fiber.Config{
		AppName:      "CampusConnect API",
		ServerHeader: "CampusConnect",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return utils.JSONError(c, code, err.Error())
		},
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))

	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	// Serve static files for uploads
	app.Static("/uploads", cfg.UploadDir)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return utils.JSONSuccess(c, fiber.StatusOK, "CampusConnect API is healthy", fiber.Map{
			"version": "1.0.0",
		})
	})

	api := app.Group("/api")

	// Authentication Endpoints
	auth := api.Group("/auth")
	auth.Post("/register", handlers.RegisterStudent(cfg))
	auth.Post("/login", handlers.Login(cfg))
	auth.Post("/logout", handlers.Logout())
	auth.Get("/me", middleware.AuthRequired(cfg.JWTSecret), handlers.GetMe())
	auth.Put("/profile", middleware.AuthRequired(cfg.JWTSecret), handlers.UpdateProfile())

	// Public & Authenticated Event Endpoints
	api.Get("/events", middleware.OptionalAuth(cfg.JWTSecret), handlers.ListEvents())
	api.Get("/events/:id", middleware.OptionalAuth(cfg.JWTSecret), handlers.GetEvent())

	// Student Event Registration Endpoints (Requires Student Role)
	api.Post("/events/:id/register", middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("student"), handlers.RegisterForEvent())
	api.Delete("/events/:id/register", middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("student"), handlers.CancelRegistration())
	api.Get("/me/registrations", middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("student"), handlers.GetMyRegistrations())

	// Teacher Event Management Endpoints (Requires Teacher Role)
	api.Post("/events", middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("teacher"), handlers.CreateEvent())
	api.Put("/events/:id", middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("teacher"), handlers.UpdateEvent())
	api.Patch("/events/:id/status", middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("teacher"), handlers.UpdateEventStatus())
	api.Delete("/events/:id", middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("teacher"), handlers.DeleteEvent())
	api.Post("/upload", middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("teacher"), handlers.UploadPoster(cfg))

	teacher := api.Group("/teacher", middleware.AuthRequired(cfg.JWTSecret), middleware.RequireRole("teacher"))
	teacher.Get("/dashboard", handlers.GetTeacherDashboardStats())
	teacher.Get("/events", handlers.GetTeacherEvents())
	teacher.Get("/events/:id/participants", handlers.GetEventParticipants())
	teacher.Get("/events/:id/statistics", handlers.GetEventStatistics())
	teacher.Get("/events/:id/export", handlers.ExportEventParticipantsCSV())

	// Start server
	go func() {
		addr := ":" + cfg.ServerPort
		log.Printf("Starting CampusConnect Server on %s", addr)
		if err := app.Listen(addr); err != nil {
			log.Printf("Server listen error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down CampusConnect Server...")
	_ = app.Shutdown()
	log.Println("Server gracefully stopped.")
}

