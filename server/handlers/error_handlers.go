package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorResponse represents a standardized error response structure
type ErrorResponse struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// SendError sends a standardized error response
func SendError(c *gin.Context, status int, message string, err error) {
	errorResponse := ErrorResponse{
		Status:  status,
		Message: message,
	}
	if err != nil {
		errorResponse.Error = err.Error()
	}
	c.JSON(status, errorResponse)
}

// SendBadRequest sends a 400 Bad Request error
func SendBadRequest(c *gin.Context, message string, err error) {
	SendError(c, http.StatusBadRequest, message, err)
}

// SendNotFound sends a 404 Not Found error
func SendNotFound(c *gin.Context, message string) {
	SendError(c, http.StatusNotFound, message, nil)
}

// SendInternalError sends a 500 Internal Server Error
func SendInternalError(c *gin.Context, err error) {
	SendError(c, http.StatusInternalServerError, "Internal server error", err)
}
