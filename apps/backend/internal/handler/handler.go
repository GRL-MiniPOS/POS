package handler

import (
	"github/pos/internal/storage/sql"

	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(New),
)

type Handler struct {
	db *sql.DBConnections
}

type Params struct {
	fx.In

	DB *sql.DBConnections
}

func New(p Params) *Handler {
	return &Handler{db: p.DB}
}

func (h *Handler) RegisterRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	{
		v1.GET("/health", h.Health)

		products := v1.Group("/products")
		{
			products.GET("", h.ListProducts)
		}
	}
}

// get products list
func (h *Handler) ListProducts(c *gin.Context) {
	// TODO: implement product list logic
	c.JSON(http.StatusOK, gin.H{
		"products": []interface{}{"test"},
	})
}
