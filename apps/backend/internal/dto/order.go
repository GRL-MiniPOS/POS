package dto

// OrderCreateRequest represents the request to create an order.
//
// Rules:
// - If a product has variants, product_variant_id is required.
// - If a product has no variants, product_variant_id must be omitted.
// - product_variant_id must belong to product_id.
// - Inactive products or variants cannot be added to orders.
type OrderCreateRequest struct {
	CustomerID string                   `json:"customer_id,omitempty" binding:"omitempty,uuid4" example:"20a97d01-4c0b-4f52-84dd-7e5b36d22cc1"`
	Payment    string                   `json:"payment,omitempty" example:"bank_transfer"`
	Source     string                   `json:"source,omitempty" example:"instagram"`
	Items      []OrderItemCreateRequest `json:"items" binding:"required,min=1,dive"`
}

type OrderItemCreateRequest struct {
	ProductID        string  `json:"product_id" binding:"required,uuid4" example:"6d1fb22a-2eb3-4a8a-9750-b4d63b56b971"`
	ProductVariantID *string `json:"product_variant_id,omitempty" binding:"omitempty,uuid4" example:"9b0d5d3d-6e44-43ad-9952-d80f9204fd9f"`
	Quantity         int     `json:"quantity" binding:"required,min=1" example:"1"`
}

type OrderResponse struct {
	ID            string              `json:"id" example:"71852cd1-d5e6-43f2-8c63-3118ef0117bb"`
	CustomerID    *string             `json:"customer_id,omitempty" example:"20a97d01-4c0b-4f52-84dd-7e5b36d22cc1"`
	Payment       *string             `json:"payment,omitempty" example:"bank_transfer"`
	Source        *string             `json:"source,omitempty" example:"instagram"`
	TotalPrice    int64               `json:"total_price" example:"1180"`
	OriginalPrice int64               `json:"original_price" example:"1180"`
	Status        string              `json:"status" example:"pending" enums:"pending,processing,shipped,completed,cancelled"`
	Items         []OrderItemResponse `json:"items"`
	CreatedAt     string              `json:"created_at" example:"2026-05-10T10:00:00Z"`
	UpdatedAt     string              `json:"updated_at" example:"2026-05-10T10:00:00Z"`
}

type OrderItemResponse struct {
	ID               string                  `json:"id" example:"fcb4f63c-bb91-45f2-9756-837bc2df0d68"`
	ProductID        *string                 `json:"product_id" example:"6d1fb22a-2eb3-4a8a-9750-b4d63b56b971"`
	ProductVariantID *string                 `json:"product_variant_id,omitempty" example:"9b0d5d3d-6e44-43ad-9952-d80f9204fd9f"`
	ProductName      string                  `json:"product_name" example:"經典白色T恤"`
	Variant          *ProductVariantResponse `json:"variant,omitempty"`
	Quantity         int                     `json:"quantity" example:"2"`
	UnitPrice        int64                   `json:"unit_price" example:"590"`
	Subtotal         int64                   `json:"subtotal" example:"1180"`
}

type OrderCreateSuccessResponse struct {
	Success bool          `json:"success" example:"true"`
	Data    OrderResponse `json:"data"`
}
