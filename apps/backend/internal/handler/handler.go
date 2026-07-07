package handler

import (
	"github/pos/internal/repository"
	"github/pos/internal/storage/sql"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(New),
)

type Handler struct {
	db           *sql.DBConnections
	categoryRepo *repository.CategoryRepository
	assetRepo    *repository.AssetRepository
	productRepo  *repository.ProductRepository
}

type Params struct {
	fx.In

	DB *sql.DBConnections
}

func New(p Params) *Handler {
	// Get read-write database connection
	db := p.DB.ReadWriteDB

	return &Handler{
		db:           p.DB,
		categoryRepo: repository.NewCategoryRepository(db),
		assetRepo:    repository.NewAssetRepository(db),
		productRepo:  repository.NewProductRepository(db),
	}
}

func (h *Handler) RegisterRoutes(router *gin.Engine) {
	// Serve static assets
	router.Static("/assets", "./assets")

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	v1 := router.Group("/api")
	{
		// Health check
		v1.GET("/health", h.Health)

		// Upload endpoint
		v1.POST("/upload", h.Upload)

		// Product categories
		v1.GET("/product-categories", h.GetCategories)
		v1.POST("/product-categories", h.CreateCategory)
		v1.PATCH("/product-categories/reorder", h.ReorderCategories)
		v1.PATCH("/product-categories/:id", h.UpdateCategory)
		v1.DELETE("/product-categories/:id", h.DeleteCategory)

		// Products
		v1.GET("/products", h.ListProducts)
		v1.GET("/products/:id", h.GetProduct)
		v1.POST("/products", h.CreateProduct)
		v1.PATCH("/products/:id", h.UpdateProduct)
		v1.DELETE("/products/:id", h.DeleteProduct)
		v1.POST("/products/batch-delete", h.BatchDeleteProducts)

		// Product option groups and variants
		v1.GET("/product-options", h.GetProductOptions)
		v1.GET("/product-specifications", h.GetProductOptions)

		// Orders
		v1.POST("/orders", h.CreateOrder)
	}
}
