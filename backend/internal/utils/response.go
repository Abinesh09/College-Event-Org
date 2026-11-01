package utils

import (
	"math"

	"github.com/gofiber/fiber/v2"
)

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

type PaginationMeta struct {
	CurrentPage  int `json:"current_page"`
	PerPage      int `json:"per_page"`
	TotalItems   int `json:"total_items"`
	TotalPages   int `json:"total_pages"`
	HasNextPage  bool `json:"has_next_page"`
	HasPrevPage  bool `json:"has_prev_page"`
}

type PaginatedResponse struct {
	Success    bool           `json:"success"`
	Message    string         `json:"message"`
	Data       interface{}    `json:"data"`
	Pagination PaginationMeta `json:"pagination"`
}

func JSONSuccess(c *fiber.Ctx, status int, message string, data interface{}) error {
	return c.Status(status).JSON(Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func JSONError(c *fiber.Ctx, status int, message string, details ...interface{}) error {
	var errDetail interface{}
	if len(details) > 0 {
		errDetail = details[0]
	}
	return c.Status(status).JSON(Response{
		Success: false,
		Message: message,
		Error:   errDetail,
	})
}

func JSONPagination(c *fiber.Ctx, status int, message string, data interface{}, page, limit, total int) error {
	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	meta := PaginationMeta{
		CurrentPage: page,
		PerPage:     limit,
		TotalItems:  total,
		TotalPages:  totalPages,
		HasNextPage: page < totalPages,
		HasPrevPage: page > 1,
	}

	return c.Status(status).JSON(PaginatedResponse{
		Success:    true,
		Message:    message,
		Data:       data,
		Pagination: meta,
	})
}

