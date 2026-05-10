package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthResponse struct {
	Status    string    `json:"status" example:"ok"`
	Timestamp time.Time `json:"timestamp" example:"2025-01-04T10:00:00Z"`
	Version   string    `json:"version" example:"1.0.0"`
	DBStatus  string    `json:"db_status" example:"up"`
}

// Health godoc
// @Summary      健康檢查
// @Description  檢查服務和資料庫的健康狀態
// @Tags         System
// @Produce      json
// @Success      200  {object}  HealthResponse
// @Router       /health [get]
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
