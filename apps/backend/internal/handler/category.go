package handler

import (
	"net/http"
	"strings"

	"github/pos/internal/dto"
	"github/pos/internal/model"

	"github.com/gin-gonic/gin"
)

// GetCategories godoc
// @Summary      取得商品分類列表
// @Description  取得所有商品分類，支援 active 和 parent_id 篩選
// @Tags         Categories
// @Produce      json
// @Param        active     query     string  false  "是否只顯示啟用的分類 (true/false)" default(true)
// @Param        parent_id  query     string  false  "父分類 ID；不傳回全部分類，空字串表示頂層分類，UUID 表示指定父分類下的子分類"
// @Success      200  {object}  dto.CategoryListResponse  "成功"
// @Failure      500  {object}  dto.ErrorResponse  "伺服器錯誤"
// @Router       /product-categories [get]
func (h *Handler) GetCategories(c *gin.Context) {
	// Parse query parameters
	activeParam := c.DefaultQuery("active", "true")
	parentID, hasParentID := c.GetQuery("parent_id")

	// Determine if we should filter by active status
	activeOnly := true
	activeValue := strings.ToLower(activeParam)
	if activeValue != "true" && activeValue != "false" {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{
			Field:   "active",
			Message: "只能是 true 或 false",
		})
		return
	}
	if activeValue == "false" {
		activeOnly = false
	}

	// Handle parent_id parameter
	var parentIDPtr *string
	if hasParentID {
		if parentID != "" && !validateUUIDField(c, "parent_id", parentID) {
			return
		}
		parentIDPtr = &parentID
	}

	// Get categories from repository
	categories, err := h.categoryRepo.GetAll(c.Request.Context(), activeOnly, parentIDPtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeInternalServerError,
				Message: "無法獲取商品類別",
			},
		})
		return
	}

	// Convert to response DTOs
	categoryResponses := dto.ToCategoryResponses(categories)
	total := len(categoryResponses)

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Data:    categoryResponses,
		Total:   &total,
	})
}

// CreateCategory godoc
// @Summary      新增商品分類
// @Description  新增一個新的商品分類。頂層分類請省略 parent_id 或傳 null；子分類請傳父分類 UUID；parent_id 不接受空字串。order 不傳時會自動排到同層最後。
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Param        request  body      dto.CreateCategoryRequest  true  "分類資訊"
// @Success      200      {object}  dto.CreateCategorySuccessResponse  "成功"
// @Failure      400      {object}  dto.ErrorResponse  "參數錯誤或分類名稱已存在"
// @Failure      500      {object}  dto.ErrorResponse  "伺服器錯誤"
// @Router       /product-categories [post]
func (h *Handler) CreateCategory(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondBindError(c, err)
		return
	}
	if req.ParentID != nil && strings.TrimSpace(*req.ParentID) == "" {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{
			Field:   "parent_id",
			Message: "不可為空字串；頂層分類請傳 null 或省略 parent_id",
		})
		return
	}

	// Check if category name already exists
	existing, err := h.categoryRepo.GetByName(c.Request.Context(), req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeInternalServerError,
				Message: "無法檢查分類名稱",
			},
		})
		return
	}
	if existing != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeCategoryNameExists,
				Message: "分類名稱已存在",
			},
		})
		return
	}

	// Check if parent category exists (if parent_id provided)
	if req.ParentID != nil && *req.ParentID != "" {
		parent, err := h.categoryRepo.GetByID(c.Request.Context(), *req.ParentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeInternalServerError,
					Message: "無法檢查父分類",
				},
			})
			return
		}
		if parent == nil {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeParentNotFound,
					Message: "父分類不存在",
				},
			})
			return
		}
	}

	// Create category
	category := &model.ProductCategory{
		Name:     req.Name,
		ParentID: req.ParentID,
		Active:   true,
	}

	if req.Order != nil {
		category.Order = *req.Order
	} else {
		nextOrder, err := h.categoryRepo.GetNextOrder(c.Request.Context(), req.ParentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeInternalServerError,
					Message: "無法計算分類排序",
				},
			})
			return
		}
		category.Order = nextOrder
	}

	err = h.categoryRepo.Create(c.Request.Context(), category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeInternalServerError,
				Message: "無法新增分類",
			},
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Data: dto.CreateCategoryResponse{
			ID:      category.ID,
			Message: "分類新增成功",
		},
	})
}

// DeleteCategory godoc
// @Summary      刪除商品分類
// @Description  刪除指定分類（會一併刪除子分類，商品轉為未分類）
// @Tags         Categories
// @Produce      json
// @Param        id   path      string  true  "分類 ID (UUID)"
// @Success      200  {object}  dto.DeleteCategorySuccessResponse  "成功"
// @Failure      400  {object}  dto.ErrorResponse  "分類仍有庫存商品"
// @Failure      404  {object}  dto.ErrorResponse  "分類不存在"
// @Failure      500  {object}  dto.ErrorResponse  "伺服器錯誤"
// @Router       /product-categories/{id} [delete]
func (h *Handler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	if !validateUUIDField(c, "id", id) {
		return
	}

	// Check if category exists
	category, err := h.categoryRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeInternalServerError,
				Message: "無法檢查分類",
			},
		})
		return
	}
	if category == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeCategoryNotFound,
				Message: "分類不存在",
			},
		})
		return
	}

	// Check if category has products with stock
	hasProducts, err := h.categoryRepo.HasProducts(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeInternalServerError,
				Message: "無法檢查商品",
			},
		})
		return
	}
	if hasProducts {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeCategoryInUse,
				Message: "無法刪除分類，該分類的商品仍有庫存",
			},
		})
		return
	}

	// Delete category (will cascade delete subcategories and set products to NULL)
	err = h.categoryRepo.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeInternalServerError,
				Message: "無法刪除分類",
			},
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Data: map[string]string{
			"message": "分類刪除成功",
		},
	})
}
