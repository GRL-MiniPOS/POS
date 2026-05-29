package dto

import (
	"github/pos/internal/model"
	"strconv"
)

// ProductOptionGroupRequest represents one custom product option dimension.
type ProductOptionGroupRequest struct {
	Name   string   `json:"name" binding:"required,min=1,max=30" example:"顏色"`
	Values []string `json:"values" binding:"required,min=1,max=50,dive,required,min=1,max=50" example:"白色,黑色"`
}

// ProductOptionGroupResponse represents one custom product option dimension.
type ProductOptionGroupResponse struct {
	ID       string   `json:"id" example:"21a4c97a-8f60-4f50-9d37-13b8e43f39ce"`
	Name     string   `json:"name" example:"顏色"`
	Values   []string `json:"values" example:"白色,黑色"`
	Position int      `json:"position" example:"0"`
}

// ProductVariantRequest represents one sellable variant combination.
type ProductVariantRequest struct {
	ID           string            `json:"id,omitempty" binding:"omitempty,uuid4" example:"9b0d5d3d-6e44-43ad-9952-d80f9204fd9f"`
	OptionValues map[string]string `json:"option_values" binding:"required" example:"顏色:白色,尺寸:S"`
	Quantity     int               `json:"quantity" binding:"min=0" example:"0"`
	SaleStatus   string            `json:"sale_status,omitempty" binding:"omitempty,oneof=active inactive" example:"active" enums:"active,inactive"`
}

// ProductVariantResponse represents one sellable variant in API responses.
type ProductVariantResponse struct {
	ID           string            `json:"id" example:"9b0d5d3d-6e44-43ad-9952-d80f9204fd9f"`
	OptionValues map[string]string `json:"option_values" example:"顏色:白色,尺寸:S"`
	Quantity     int               `json:"quantity" example:"0"`
	StockStatus  string            `json:"stock_status" example:"out-of-stock" enums:"in-stock,out-of-stock"`
	SaleStatus   string            `json:"sale_status" example:"active" enums:"active,inactive"`
	CanOrder     bool              `json:"can_order" example:"true"`
}

// CreateProductRequest represents the request to create a product.
//
// Rules:
// - option_groups accepts 0 to 2 custom option groups.
// - option_groups=[] means a product without variants; quantity is required and variants must be empty.
// - option_groups has items means variants is required and product-level quantity must be omitted or 0.
// - quantity=0 means out of stock but can still be pre-ordered while sale_status is active.
type CreateProductRequest struct {
	Name         string                      `json:"name" binding:"required,min=1,max=100" example:"經典白色T恤"`
	CategoryID   string                      `json:"category_id" binding:"required,uuid4" example:"2c619823-aa6b-4e7e-931f-c8358bb07861"`
	Price        string                      `json:"price" binding:"required" example:"590"`
	Quantity     *int                        `json:"quantity,omitempty" binding:"omitempty,min=0" example:"0"`
	SaleStatus   string                      `json:"sale_status,omitempty" binding:"omitempty,oneof=active inactive" example:"active" enums:"active,inactive"`
	OptionGroups []ProductOptionGroupRequest `json:"option_groups,omitempty" binding:"omitempty,max=2,dive"`
	Variants     []ProductVariantRequest     `json:"variants,omitempty" binding:"omitempty,dive"`
	ImageIDs     []string                    `json:"image_ids,omitempty" binding:"omitempty,dive,uuid4"`
}

// UpdateProductRequest represents the request to update a product.
//
// If option_groups or variants is provided, both fields are treated as a full replacement of the product option structure.
type UpdateProductRequest struct {
	Name         *string                      `json:"name,omitempty" binding:"omitempty,min=1,max=100" example:"經典黑色T恤"`
	CategoryID   *string                      `json:"category_id,omitempty" binding:"omitempty,uuid4" example:"2c619823-aa6b-4e7e-931f-c8358bb07861"`
	Price        *string                      `json:"price,omitempty" example:"690"`
	Quantity     *int                         `json:"quantity,omitempty" binding:"omitempty,min=0" example:"0"`
	SaleStatus   *string                      `json:"sale_status,omitempty" binding:"omitempty,oneof=active inactive" example:"active" enums:"active,inactive"`
	OptionGroups *[]ProductOptionGroupRequest `json:"option_groups,omitempty" binding:"omitempty,max=2,dive"`
	Variants     *[]ProductVariantRequest     `json:"variants,omitempty" binding:"omitempty,dive"`
	ImageIDs     *[]string                    `json:"image_ids,omitempty" binding:"omitempty,dive,uuid4"`
}

// BatchDeleteRequest represents the request to batch delete products
type BatchDeleteRequest struct {
	IDs []string `json:"ids" binding:"required,min=1,dive,uuid4" example:"6d1fb22a-2eb3-4a8a-9750-b4d63b56b971"`
}

// CreateProductResponse represents the response after creating a product
type CreateProductResponse struct {
	ID      string `json:"id" example:"6d1fb22a-2eb3-4a8a-9750-b4d63b56b971"`
	Message string `json:"message" example:"商品新增成功"`
}

// UpdateProductResponse represents the response after updating a product
type UpdateProductResponse struct {
	ID      string `json:"id" example:"6d1fb22a-2eb3-4a8a-9750-b4d63b56b971"`
	Message string `json:"message" example:"商品更新成功"`
}

// DeleteProductResponse represents the response after deleting a product
type DeleteProductResponse struct {
	Message string `json:"message" example:"商品刪除成功"`
}

// BatchDeleteProductResponse represents the response after batch deleting products
type BatchDeleteProductResponse struct {
	DeletedCount int    `json:"deleted_count" example:"2"`
	Message      string `json:"message" example:"2 個商品已刪除"`
}

// ProductCategoryInfo represents category information in product response
type ProductCategoryInfo struct {
	ID   string `json:"id" example:"2c619823-aa6b-4e7e-931f-c8358bb07861"`
	Name string `json:"name" example:"上衣"`
}

// ProductImageResponse represents an image in the product response
type ProductImageResponse struct {
	ID           string  `json:"id" example:"bdf73d34-54d4-4e3f-b47b-2fcbfc33a51f"`
	Name         string  `json:"name" example:"product-a.jpg"`
	Mime         string  `json:"mime" example:"image/jpeg"`
	Size         int64   `json:"size" example:"523412"`
	Width        int     `json:"width" example:"1600"`
	Height       int     `json:"height" example:"1200"`
	URL          string  `json:"url" example:"https://pos-backend-production-2ccc.up.railway.app/assets/2026/05/product-a.jpg"`
	ThumbURL     *string `json:"thumb_url" extensions:"x-nullable"`
	DisplayOrder int     `json:"display_order" example:"0"`
	CreatedAt    string  `json:"created_at" example:"2026-05-07T10:00:00Z"`
}

// ProductResponse represents a product in the list response
type ProductResponse struct {
	ID           string                       `json:"id" example:"6d1fb22a-2eb3-4a8a-9750-b4d63b56b971"`
	Name         string                       `json:"name" example:"經典白色T恤"`
	Category     *ProductCategoryInfo         `json:"category"`
	Price        int64                        `json:"price" example:"590"`
	Quantity     int                          `json:"quantity" example:"0"`
	Stock        int                          `json:"stock" example:"0"`
	StockStatus  string                       `json:"stock_status" example:"out-of-stock" enums:"in-stock,out-of-stock"`
	SaleStatus   string                       `json:"sale_status" example:"active" enums:"active,inactive"`
	CanOrder     bool                         `json:"can_order" example:"true"`
	HasVariants  bool                         `json:"has_variants" example:"true"`
	OptionGroups []ProductOptionGroupResponse `json:"option_groups"`
	Variants     []ProductVariantResponse     `json:"variants"`
	Image        string                       `json:"image" example:"https://pos-backend-production-2ccc.up.railway.app/assets/2026/05/product-a.jpg"`
	CreatedAt    string                       `json:"created_at" example:"2026-05-07T10:00:00Z"`
	UpdatedAt    string                       `json:"updated_at" example:"2026-05-07T10:00:00Z"`
}

// ProductDetailResponse represents a product with full details
type ProductDetailResponse ProductResponse

// CreateProductSuccessResponse represents a successful product creation response
type CreateProductSuccessResponse struct {
	Success bool                  `json:"success" example:"true"`
	Data    CreateProductResponse `json:"data"`
}

// UpdateProductSuccessResponse represents a successful product update response
type UpdateProductSuccessResponse struct {
	Success bool                  `json:"success" example:"true"`
	Data    UpdateProductResponse `json:"data"`
}

// DeleteProductSuccessResponse represents a successful product deletion response
type DeleteProductSuccessResponse struct {
	Success bool                  `json:"success" example:"true"`
	Data    DeleteProductResponse `json:"data"`
}

// BatchDeleteProductSuccessResponse represents a successful batch delete response
type BatchDeleteProductSuccessResponse struct {
	Success bool                       `json:"success" example:"true"`
	Data    BatchDeleteProductResponse `json:"data"`
}

// ProductDetailSuccessResponse represents the response for one product
type ProductDetailSuccessResponse struct {
	Success bool                  `json:"success" example:"true"`
	Data    ProductDetailResponse `json:"data"`
}

// ProductListResponse represents the response for listing products
type ProductListResponse struct {
	Success    bool               `json:"success" example:"true"`
	Data       []ProductResponse  `json:"data"`
	Pagination PaginationResponse `json:"pagination"`
}

// ProductOptionListResponse represents the response for listing option names and values.
type ProductOptionListResponse struct {
	Success bool                         `json:"success" example:"true"`
	Data    []ProductOptionGroupResponse `json:"data"`
	Total   int                          `json:"total" example:"2"`
}

func ToProductResponse(p *model.ProductWithDetails) ProductResponse {
	resp := ProductResponse{
		ID:           p.ID,
		Name:         p.Name,
		Price:        p.Price,
		Quantity:     p.Quantity,
		Stock:        p.Stock,
		StockStatus:  stockStatus(p.Stock),
		SaleStatus:   string(p.SaleStatus),
		CanOrder:     productCanOrder(p),
		HasVariants:  p.HasVariants,
		OptionGroups: toOptionGroupResponses(p.OptionGroups),
		Variants:     toVariantResponses(p),
		CreatedAt:    p.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:    p.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}

	if p.Category != nil {
		resp.Category = &ProductCategoryInfo{ID: p.Category.ID, Name: p.Category.Name}
	}
	if len(p.Images) > 0 {
		resp.Image = p.Images[0].URL
	}
	return resp
}

func ToProductResponses(products []model.ProductWithDetails) []ProductResponse {
	result := make([]ProductResponse, len(products))
	for i, p := range products {
		result[i] = ToProductResponse(&p)
	}
	return result
}

func ToProductDetailResponse(p *model.ProductWithDetails) ProductDetailResponse {
	resp := ToProductResponse(p)
	return ProductDetailResponse(resp)
}

func toOptionGroupResponses(groups []model.ProductOptionGroupWithValues) []ProductOptionGroupResponse {
	result := make([]ProductOptionGroupResponse, len(groups))
	for i, group := range groups {
		values := make([]string, len(group.Values))
		for j, value := range group.Values {
			values[j] = value.Value
		}
		result[i] = ProductOptionGroupResponse{
			ID:       group.ID,
			Name:     group.Name,
			Values:   values,
			Position: group.Position,
		}
	}
	return result
}

func toVariantResponses(p *model.ProductWithDetails) []ProductVariantResponse {
	result := make([]ProductVariantResponse, len(p.Variants))
	for i, variant := range p.Variants {
		result[i] = ProductVariantResponse{
			ID:           variant.ID,
			OptionValues: variant.OptionValues,
			Quantity:     variant.Quantity,
			StockStatus:  stockStatus(variant.Quantity),
			SaleStatus:   string(variant.SaleStatus),
			CanOrder:     p.SaleStatus == model.SaleStatusActive && variant.SaleStatus == model.SaleStatusActive,
		}
	}
	return result
}

func productCanOrder(p *model.ProductWithDetails) bool {
	if p.SaleStatus != model.SaleStatusActive {
		return false
	}
	if !p.HasVariants {
		return true
	}
	for _, variant := range p.Variants {
		if variant.SaleStatus == model.SaleStatusActive {
			return true
		}
	}
	return false
}

func ParsePrice(priceStr string) (int64, error) {
	return strconv.ParseInt(priceStr, 10, 64)
}

func stockStatus(stock int) string {
	if stock > 0 {
		return "in-stock"
	}
	return "out-of-stock"
}
