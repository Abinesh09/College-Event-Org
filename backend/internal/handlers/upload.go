package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"campusconnect/internal/config"
	"campusconnect/internal/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func UploadPoster(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		file, err := c.FormFile("poster")
		if err != nil {
			return utils.JSONError(c, fiber.StatusBadRequest, "No file provided under form field 'poster'")
		}

		// Validate extension
		ext := strings.ToLower(filepath.Ext(file.Filename))
		allowedExts := map[string]bool{
			".jpg":  true,
			".jpeg": true,
			".png":  true,
			".webp": true,
			".gif":  true,
		}
		if !allowedExts[ext] {
			return utils.JSONError(c, fiber.StatusBadRequest, "Invalid file format. Allowed formats: JPG, PNG, WEBP, GIF")
		}

		// Ensure upload directory exists
		if err := os.MkdirAll(cfg.UploadDir, 0755); err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to create upload directory")
		}

		// Unique file name
		filename := fmt.Sprintf("poster_%s_%d%s", uuid.New().String()[:8], time.Now().Unix(), ext)
		destPath := filepath.Join(cfg.UploadDir, filename)

		if err := c.SaveFile(file, destPath); err != nil {
			return utils.JSONError(c, fiber.StatusInternalServerError, "Failed to save uploaded file", err.Error())
		}

		fileURL := fmt.Sprintf("/uploads/%s", filename)
		return utils.JSONSuccess(c, fiber.StatusOK, "File uploaded successfully", fiber.Map{
			"url":      fileURL,
			"filename": filename,
		})
	}
}
