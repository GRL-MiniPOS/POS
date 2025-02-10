package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Version   string    `json:"version"`
	DBStatus  string    `json:"db_status"`
}

func (h *Handler) Health(c *gin.Context) {
	dbStatus := "up"
	if err := h.db.ReadDB.Ping(); err != nil {
		dbStatus = "down"
	}

	response := HealthResponse{
		Status:    "ok",
		Timestamp: time.Now(),
		Version:   "1.0.0",
		DBStatus:  dbStatus,
	}

	c.JSON(http.StatusOK, response)
}
