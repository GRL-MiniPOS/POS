package handler

import (
	"net/http"
	"strconv"
	"time"

	"github/pos/internal/dto"
	"github/pos/internal/model"
	possql "github/pos/internal/storage/sql"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// CreateOrder godoc
// @Summary      新增訂單
// @Description  建立手動訂單。若商品有 variants，items[].product_variant_id 必填；若商品無 variants，items[].product_variant_id 不可提供。product_variant_id 必須屬於 product_id。product 或 variant 下架時不可加入訂單。quantity=0 的商品/variant 仍可預購，不阻擋下單。
// @Description
// @Description  有變體商品訂單範例：{"source":"instagram","payment":"bank_transfer","items":[{"product_id":"...","product_variant_id":"...","quantity":1}]}
// @Description
// @Description  無變體商品訂單範例：{"source":"facebook","payment":"cash","items":[{"product_id":"...","quantity":1}]}
// @Description
// @Description  錯誤範例：商品有變體但未帶 product_variant_id 時，回傳 VALIDATION_ERROR，field 為 items[0].product_variant_id。
// @Tags         Orders
// @Accept       json
// @Produce      json
// @Param        request  body      dto.OrderCreateRequest  true  "訂單資訊"
// @Success      200      {object}  dto.OrderCreateSuccessResponse  "成功"
// @Failure      400      {object}  dto.ErrorResponse  "VALIDATION_ERROR / BUSINESS_RULE_ERROR"
// @Failure      404      {object}  dto.ErrorResponse  "PRODUCT_NOT_FOUND"
// @Failure      500      {object}  dto.ErrorResponse  "INTERNAL_SERVER_ERROR"
// @Router       /orders [post]
func (h *Handler) CreateOrder(c *gin.Context) {
	var req dto.OrderCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondBindError(c, err)
		return
	}

	itemProducts := make([]*model.ProductWithDetails, len(req.Items))
	total := int64(0)
	for i, item := range req.Items {
		product, err := h.productRepo.GetByID(c.Request.Context(), item.ProductID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Success: false, Error: dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法檢查商品"}})
			return
		}
		if product == nil {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeProductNotFound,
					Message: "商品不存在",
					Fields:  []dto.ValidationFieldError{{Field: "items[" + itoa(i) + "].product_id", Message: "商品不存在"}},
				},
			})
			return
		}
		if ok := validateOrderItemProduct(c, i, product, item.ProductVariantID); !ok {
			return
		}
		itemProducts[i] = product
		total += product.Price * int64(item.Quantity)
	}

	var orderID string
	now := time.Now()
	err := possql.RunInTx(c.Request.Context(), h.db.ReadWriteDB, func(tx *sqlx.Tx) error {
		orderQuery := `INSERT INTO orders (customer_id, payment, source, total_price, original_price, status)
		               VALUES ($1, $2, $3, $4, $5, 'pending')
		               RETURNING id, created_at, updated_at`
		var createdAt, updatedAt time.Time
		var customerID *string
		if req.CustomerID != "" {
			customerID = &req.CustomerID
		}
		var payment *string
		if req.Payment != "" {
			payment = &req.Payment
		}
		var source *string
		if req.Source != "" {
			source = &req.Source
		}
		if err := tx.QueryRowContext(c.Request.Context(), orderQuery, customerID, payment, source, total, total).Scan(&orderID, &createdAt, &updatedAt); err != nil {
			return err
		}
		now = createdAt

		itemQuery := `INSERT INTO order_items (order_id, product_id, product_variant_id, quantity, unit_price, subtotal)
		              VALUES ($1, $2, $3, $4, $5, $6)`
		for i, item := range req.Items {
			subtotal := itemProducts[i].Price * int64(item.Quantity)
			if _, err := tx.ExecContext(c.Request.Context(), itemQuery, orderID, item.ProductID, item.ProductVariantID, item.Quantity, itemProducts[i].Price, subtotal); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Success: false, Error: dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法新增訂單"}})
		return
	}

	c.JSON(http.StatusOK, dto.OrderCreateSuccessResponse{
		Success: true,
		Data: dto.OrderResponse{
			ID:            orderID,
			TotalPrice:    total,
			OriginalPrice: total,
			Status:        string(model.OrderStatusPending),
			Items:         []dto.OrderItemResponse{},
			CreatedAt:     now.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:     now.Format("2006-01-02T15:04:05Z"),
		},
	})
}

func validateOrderItemProduct(c *gin.Context, index int, product *model.ProductWithDetails, productVariantID *string) bool {
	if product.SaleStatus != model.SaleStatusActive {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeBusinessRuleError,
				Message: "商品已下架，無法加入訂單",
				Fields:  []dto.ValidationFieldError{{Field: "items[" + itoa(index) + "].product_id", Message: "商品已下架"}},
			},
		})
		return false
	}

	if product.HasVariants {
		if productVariantID == nil || *productVariantID == "" {
			respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{
				Field:   "items[" + itoa(index) + "].product_variant_id",
				Message: "商品有變體時必須指定 product_variant_id",
			})
			return false
		}
		for _, variant := range product.Variants {
			if variant.ID == *productVariantID {
				if variant.SaleStatus != model.SaleStatusActive {
					c.JSON(http.StatusBadRequest, dto.ErrorResponse{
						Success: false,
						Error: dto.ErrorDetail{
							Code:    dto.ErrCodeBusinessRuleError,
							Message: "商品變體已下架，無法加入訂單",
							Fields:  []dto.ValidationFieldError{{Field: "items[" + itoa(index) + "].product_variant_id", Message: "商品變體已下架"}},
						},
					})
					return false
				}
				return true
			}
		}
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{
			Field:   "items[" + itoa(index) + "].product_variant_id",
			Message: "product_variant_id 必須屬於該 product_id",
		})
		return false
	}

	if productVariantID != nil && *productVariantID != "" {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{
			Field:   "items[" + itoa(index) + "].product_variant_id",
			Message: "商品無變體時不可指定 product_variant_id",
		})
		return false
	}
	return true
}

func itoa(v int) string {
	return strconv.Itoa(v)
}
