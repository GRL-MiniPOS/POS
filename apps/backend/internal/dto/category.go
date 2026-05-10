package dto

import "github/pos/internal/model"

// CreateCategoryRequest represents the request to create a category
type CreateCategoryRequest struct {
	Name     string  `json:"name" binding:"required,min=1,max=100" example:"上衣"`
	ParentID *string `json:"parent_id,omitempty" binding:"omitempty,uuid4" extensions:"x-nullable" example:"2c619823-aa6b-4e7e-931f-c8358bb07861"`
	Order    *int    `json:"order,omitempty" example:"1"`
}

// CreateCategoryResponse represents the response after creating a category
type CreateCategoryResponse struct {
	ID      string `json:"id" example:"f47ac10b-58cc-4372-a567-0e02b2c3d479"`
	Message string `json:"message" example:"分類新增成功"`
}

// CategoryResponse represents a category in the response
type CategoryResponse struct {
	ID        string  `json:"id" example:"2c619823-aa6b-4e7e-931f-c8358bb07861"`
	Name      string  `json:"name" example:"上衣"`
	ParentID  *string `json:"parent_id" extensions:"x-nullable" example:"2c619823-aa6b-4e7e-931f-c8358bb07861"`
	Order     int     `json:"order" example:"1"`
	Active    bool    `json:"active" example:"true"`
	CreatedAt string  `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt string  `json:"updated_at" example:"2024-01-01T00:00:00Z"`
}

// CategoryListResponse represents the response for listing categories
type CategoryListResponse struct {
	Success bool               `json:"success" example:"true"`
	Data    []CategoryResponse `json:"data"`
	Total   int                `json:"total" example:"2"`
}

// CreateCategorySuccessResponse represents a successful category creation response
type CreateCategorySuccessResponse struct {
	Success bool                   `json:"success" example:"true"`
	Data    CreateCategoryResponse `json:"data"`
}

// DeleteCategoryResponse represents the response after deleting a category
type DeleteCategoryResponse struct {
	Message string `json:"message" example:"分類刪除成功"`
}

// DeleteCategorySuccessResponse represents a successful category deletion response
type DeleteCategorySuccessResponse struct {
	Success bool                   `json:"success" example:"true"`
	Data    DeleteCategoryResponse `json:"data"`
}

// ToResponse converts a model.ProductCategory to CategoryResponse
func ToCategoryResponse(c *model.ProductCategory) CategoryResponse {
	return CategoryResponse{
		ID:        c.ID,
		Name:      c.Name,
		ParentID:  c.ParentID,
		Order:     c.Order,
		Active:    c.Active,
		CreatedAt: c.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt: c.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}

// ToCategoryResponses converts a slice of model.ProductCategory to []CategoryResponse
func ToCategoryResponses(categories []model.ProductCategory) []CategoryResponse {
	result := make([]CategoryResponse, len(categories))
	for i, c := range categories {
		result[i] = ToCategoryResponse(&c)
	}
	return result
}
