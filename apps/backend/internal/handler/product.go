package handler

import (
	"net/http"
	"sort"
	"strconv"
	"strings"

	"github/pos/internal/dto"
	"github/pos/internal/model"
	"github/pos/internal/repository"

	"github.com/gin-gonic/gin"
)

// CreateProduct godoc
// @Summary      新增商品
// @Description  新增商品。最多兩層自訂規格；option_groups 為空代表無變體商品，使用商品層級 quantity。若有 option_groups，必須提供 variants，庫存由 variant.quantity 管理。quantity=0 僅代表無現貨，sale_status=active 時仍可預購。
// @Description
// @Description  無變體範例：{"name":"銀色項鍊","category_id":"...","price":"590","quantity":0,"sale_status":"active","option_groups":[],"variants":[]}
// @Description
// @Description  一層規格範例：{"name":"托特包","category_id":"...","price":"1280","option_groups":[{"name":"款式","values":["現貨","預購"]}],"variants":[{"option_values":{"款式":"現貨"},"quantity":3},{"option_values":{"款式":"預購"},"quantity":0}]}
// @Description
// @Description  兩層規格範例：{"name":"經典T恤","category_id":"...","price":"590","option_groups":[{"name":"顏色","values":["白色","黑色"]},{"name":"尺寸","values":["S","M"]}],"variants":[{"option_values":{"顏色":"白色","尺寸":"S"},"quantity":0,"sale_status":"active"}]}
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        request  body      dto.CreateProductRequest  true  "商品資訊；無變體商品使用 quantity，有變體商品使用 variants[].quantity"
// @Success      200      {object}  dto.CreateProductSuccessResponse  "成功"
// @Failure      400      {object}  dto.ErrorResponse  "VALIDATION_ERROR / BUSINESS_RULE_ERROR / 圖片或分類不存在"
// @Failure      409      {object}  dto.ErrorResponse  "CONFLICT：重複變體組合"
// @Failure      500      {object}  dto.ErrorResponse  "INTERNAL_SERVER_ERROR"
// @Router       /products [post]
func (h *Handler) CreateProduct(c *gin.Context) {
	var req dto.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondBindError(c, err)
		return
	}

	price, ok := parseRequestPrice(c, req.Price)
	if !ok {
		return
	}
	if !h.ensureCategoryExists(c, req.CategoryID) {
		return
	}
	if !h.ensureImagesExist(c, req.ImageIDs) {
		return
	}

	groups, variants, quantity, hasVariants, ok := buildCreateProductOptions(c, req)
	if !ok {
		return
	}

	saleStatus := model.SaleStatusActive
	if req.SaleStatus != "" {
		saleStatus = model.SaleStatus(req.SaleStatus)
	}

	product := &model.Product{
		Name:        req.Name,
		CategoryID:  &req.CategoryID,
		Price:       price,
		Quantity:    quantity,
		SaleStatus:  saleStatus,
		HasVariants: hasVariants,
	}

	if err := h.productRepo.Create(c.Request.Context(), product, groups, variants, req.ImageIDs); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法新增商品"},
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Data:    dto.CreateProductResponse{ID: product.ID, Message: "商品新增成功"},
	})
}

// GetProduct godoc
// @Summary      取得單一商品
// @Description  取得商品完整資訊，包含分類、圖片、option_groups、variants、stock_status、sale_status、can_order。stock_status 只反映庫存；can_order 只反映是否可下單。
// @Tags         Products
// @Produce      json
// @Param        id   path      string  true  "商品 ID (UUID)"
// @Success      200  {object}  dto.ProductDetailSuccessResponse  "成功"
// @Failure      400  {object}  dto.ErrorResponse  "VALIDATION_ERROR"
// @Failure      404  {object}  dto.ErrorResponse  "PRODUCT_NOT_FOUND"
// @Failure      500  {object}  dto.ErrorResponse  "INTERNAL_SERVER_ERROR"
// @Router       /products/{id} [get]
func (h *Handler) GetProduct(c *gin.Context) {
	id := c.Param("id")
	if !validateUUIDField(c, "id", id) {
		return
	}

	product, err := h.productRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法獲取商品"},
		})
		return
	}
	if product == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeProductNotFound, Message: "商品不存在"},
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Success: true, Data: dto.ToProductDetailResponse(product)})
}

// ListProducts godoc
// @Summary      取得商品列表
// @Description  取得商品列表，支援搜尋、分類、規格值、價格、庫存狀態、上下架狀態篩選。預購商品 quantity=0 時 stock_status=out-of-stock，但 sale_status=active 仍 can_order=true。
// @Tags         Products
// @Produce      json
// @Param        page          query     int       false  "頁碼"  default(1)
// @Param        limit         query     int       false  "每頁數量"  default(10)
// @Param        search        query     string    false  "商品名稱搜尋"
// @Param        categories[]  query     string    false  "分類 ID"
// @Param        options[]     query     string    false  "規格名稱或規格值搜尋，例如 白色、S、顏色"
// @Param        priceMin      query     int       false  "最低價格"
// @Param        priceMax      query     int       false  "最高價格"
// @Param        stockStatus   query     string    false  "庫存狀態 (all/in-stock/out-of-stock)"  default(all)
// @Param        saleStatus    query     string    false  "上下架狀態 (all/active/inactive)"  default(all)
// @Success      200           {object}  dto.ProductListResponse  "成功"
// @Failure      400           {object}  dto.ErrorResponse  "VALIDATION_ERROR"
// @Failure      500           {object}  dto.ErrorResponse  "INTERNAL_SERVER_ERROR"
// @Router       /products [get]
func (h *Handler) ListProducts(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "page", Message: "必須是大於或等於 1 的整數"})
		return
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 || limit > 100 {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "limit", Message: "必須是 1 到 100 之間的整數"})
		return
	}
	stockStatus := c.DefaultQuery("stockStatus", "all")
	if stockStatus != "all" && stockStatus != "in-stock" && stockStatus != "out-of-stock" {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "stockStatus", Message: "只能是 all、in-stock 或 out-of-stock"})
		return
	}
	saleStatus := c.DefaultQuery("saleStatus", "all")
	if saleStatus != "all" && saleStatus != "active" && saleStatus != "inactive" {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "saleStatus", Message: "只能是 all、active 或 inactive"})
		return
	}

	categories := c.QueryArray("categories[]")
	for index, categoryID := range categories {
		if !validateUUIDField(c, "categories["+strconv.Itoa(index)+"]", categoryID) {
			return
		}
	}

	priceMin, priceMax, ok := parsePriceRange(c)
	if !ok {
		return
	}

	filter := repository.ProductFilter{
		Search:      c.Query("search"),
		Categories:  categories,
		Options:     c.QueryArray("options[]"),
		PriceMin:    priceMin,
		PriceMax:    priceMax,
		StockStatus: stockStatus,
		SaleStatus:  saleStatus,
		Page:        page,
		Limit:       limit,
	}

	products, total, err := h.productRepo.List(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法獲取商品列表"},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    dto.ToProductResponses(products),
		"pagination": dto.PaginationResponse{
			CurrentPage: page,
			TotalPages:  (total + limit - 1) / limit,
			PerPage:     limit,
			TotalItems:  total,
		},
	})
}

// UpdateProduct godoc
// @Summary      更新商品
// @Description  部分更新商品資訊。若帶 option_groups 或 variants，兩者必須一起提供，並會完整替換商品規格結構。無變體商品不可有 variants；有變體商品必須在訂單中指定 product_variant_id。
// @Description
// @Description  更新為無變體範例：{"quantity":0,"option_groups":[],"variants":[]}
// @Description
// @Description  更新兩層規格範例：{"option_groups":[{"name":"顏色","values":["白色"]},{"name":"尺寸","values":["S"]}],"variants":[{"option_values":{"顏色":"白色","尺寸":"S"},"quantity":0,"sale_status":"active"}]}
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        id       path      string                    true  "商品 ID (UUID)"
// @Param        request  body      dto.UpdateProductRequest  true  "要更新的商品資訊"
// @Success      200      {object}  dto.UpdateProductSuccessResponse  "成功"
// @Failure      400      {object}  dto.ErrorResponse  "VALIDATION_ERROR / BUSINESS_RULE_ERROR"
// @Failure      404      {object}  dto.ErrorResponse  "PRODUCT_NOT_FOUND"
// @Failure      409      {object}  dto.ErrorResponse  "CONFLICT：重複變體組合"
// @Failure      500      {object}  dto.ErrorResponse  "INTERNAL_SERVER_ERROR"
// @Router       /products/{id} [patch]
func (h *Handler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	if !validateUUIDField(c, "id", id) {
		return
	}

	var req dto.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondBindError(c, err)
		return
	}

	existing, err := h.productRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法檢查商品"},
		})
		return
	}
	if existing == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeProductNotFound, Message: "商品不存在"},
		})
		return
	}

	product := &model.Product{
		ID:          id,
		Name:        existing.Name,
		CategoryID:  existing.CategoryID,
		Price:       existing.Price,
		Quantity:    existing.Quantity,
		SaleStatus:  existing.SaleStatus,
		HasVariants: existing.HasVariants,
	}

	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.CategoryID != nil {
		if !h.ensureCategoryExists(c, *req.CategoryID) {
			return
		}
		product.CategoryID = req.CategoryID
	}
	if req.Price != nil {
		price, ok := parseRequestPrice(c, *req.Price)
		if !ok {
			return
		}
		product.Price = price
	}
	if req.Quantity != nil {
		product.Quantity = *req.Quantity
	}
	if req.SaleStatus != nil {
		product.SaleStatus = model.SaleStatus(*req.SaleStatus)
	}
	if req.ImageIDs != nil && !h.ensureImagesExist(c, *req.ImageIDs) {
		return
	}

	var groups *[]model.ProductOptionGroupWithValues
	var variants *[]model.ProductVariant
	structureTouched := req.OptionGroups != nil || req.Variants != nil
	if structureTouched {
		if req.OptionGroups == nil || req.Variants == nil {
			respondValidationFields(c, "請求參數驗證失敗",
				dto.ValidationFieldError{Field: "option_groups", Message: "更新規格結構時 option_groups 與 variants 必須一起提供"},
				dto.ValidationFieldError{Field: "variants", Message: "更新規格結構時 option_groups 與 variants 必須一起提供"},
			)
			return
		}
		builtGroups, builtVariants, quantity, hasVariants, ok := buildProductOptions(c, *req.OptionGroups, *req.Variants, req.Quantity, "quantity")
		if !ok {
			return
		}
		product.HasVariants = hasVariants
		product.Quantity = quantity
		groups = &builtGroups
		variants = &builtVariants
	}

	if product.HasVariants && req.Quantity != nil && !structureTouched && *req.Quantity > 0 {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "quantity", Message: "有變體商品不可使用商品層級 quantity"})
		return
	}

	if err := h.productRepo.Update(c.Request.Context(), product, groups, variants, req.ImageIDs); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法更新商品"},
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Data:    dto.UpdateProductResponse{ID: id, Message: "商品更新成功"},
	})
}

// DeleteProduct godoc
// @Summary      刪除商品
// @Description  刪除指定商品（若有未完成訂單則無法刪除）
// @Tags         Products
// @Produce      json
// @Param        id   path      string  true  "商品 ID (UUID)"
// @Success      200  {object}  dto.DeleteProductSuccessResponse  "成功"
// @Failure      400  {object}  dto.ErrorResponse  "VALIDATION_ERROR / PRODUCT_IN_USE"
// @Failure      404  {object}  dto.ErrorResponse  "PRODUCT_NOT_FOUND"
// @Failure      500  {object}  dto.ErrorResponse  "INTERNAL_SERVER_ERROR"
// @Router       /products/{id} [delete]
func (h *Handler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	if !validateUUIDField(c, "id", id) {
		return
	}

	product, err := h.productRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法檢查商品"},
		})
		return
	}
	if product == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeProductNotFound, Message: "商品不存在"},
		})
		return
	}

	err = h.productRepo.Delete(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "product has pending orders" {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Success: false,
				Error:   dto.ErrorDetail{Code: dto.ErrCodeProductInUse, Message: "商品仍有未完成訂單"},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法刪除商品"},
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Success: true, Data: dto.DeleteProductResponse{Message: "商品刪除成功"}})
}

// BatchDeleteProducts godoc
// @Summary      批量刪除商品
// @Description  批量刪除多個商品
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        request  body      dto.BatchDeleteRequest  true  "商品 ID 陣列"
// @Success      200      {object}  dto.BatchDeleteProductSuccessResponse  "成功"
// @Failure      400      {object}  dto.ErrorResponse  "VALIDATION_ERROR / SOME_PRODUCTS_IN_USE"
// @Failure      500      {object}  dto.ErrorResponse  "INTERNAL_SERVER_ERROR"
// @Router       /products/batch-delete [post]
func (h *Handler) BatchDeleteProducts(c *gin.Context) {
	var req dto.BatchDeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondBindError(c, err)
		return
	}

	deletedCount, failedIDs, err := h.productRepo.BatchDelete(c.Request.Context(), req.IDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "批量刪除失敗"},
		})
		return
	}
	if len(failedIDs) > 0 {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeSomeProductsInUse, Message: "部分商品仍有未完成訂單，無法刪除", FailedIDs: failedIDs},
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Data:    dto.BatchDeleteProductResponse{DeletedCount: deletedCount, Message: strconv.Itoa(deletedCount) + " 個商品已刪除"},
	})
}

// GetProductOptions godoc
// @Summary      取得所有商品選項
// @Description  取得所有商品使用過的自訂 option_groups 與 values（去重）。option_groups 是規格類型，例如「顏色」「尺寸」「款式」；variants 是實際可販售組合。
// @Tags         Products
// @Produce      json
// @Success      200  {object}  dto.ProductOptionListResponse  "成功"
// @Failure      500  {object}  dto.ErrorResponse  "INTERNAL_SERVER_ERROR"
// @Router       /product-options [get]
func (h *Handler) GetProductOptions(c *gin.Context) {
	groups, err := h.productRepo.GetAllOptions(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error:   dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法獲取規格列表"},
		})
		return
	}

	data := dto.ToProductResponse(&model.ProductWithDetails{OptionGroups: groups}).OptionGroups
	total := len(data)
	c.JSON(http.StatusOK, dto.SuccessResponse{Success: true, Data: data, Total: &total})
}

func parseRequestPrice(c *gin.Context, raw string) (int64, bool) {
	price, err := dto.ParsePrice(raw)
	if err != nil || price < 0 {
		respondValidationFields(c, "無效的價格格式", dto.ValidationFieldError{Field: "price", Message: "必須是大於或等於 0 的整數字串"})
		return 0, false
	}
	return price, true
}

func parsePriceRange(c *gin.Context) (*int64, *int64, bool) {
	var priceMin, priceMax *int64
	if minStr := c.Query("priceMin"); minStr != "" {
		min, err := strconv.ParseInt(minStr, 10, 64)
		if err != nil || min < 0 {
			respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "priceMin", Message: "必須是大於或等於 0 的整數"})
			return nil, nil, false
		}
		priceMin = &min
	}
	if maxStr := c.Query("priceMax"); maxStr != "" {
		max, err := strconv.ParseInt(maxStr, 10, 64)
		if err != nil || max < 0 {
			respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "priceMax", Message: "必須是大於或等於 0 的整數"})
			return nil, nil, false
		}
		priceMax = &max
	}
	if priceMin != nil && priceMax != nil && *priceMin > *priceMax {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "priceMin", Message: "不可大於 priceMax"})
		return nil, nil, false
	}
	return priceMin, priceMax, true
}

func (h *Handler) ensureCategoryExists(c *gin.Context, categoryID string) bool {
	category, err := h.categoryRepo.GetByID(c.Request.Context(), categoryID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Success: false, Error: dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法檢查分類"}})
		return false
	}
	if category == nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Success: false, Error: dto.ErrorDetail{Code: dto.ErrCodeCategoryNotFound, Message: "商品類別不存在"}})
		return false
	}
	return true
}

func (h *Handler) ensureImagesExist(c *gin.Context, imageIDs []string) bool {
	if len(imageIDs) == 0 {
		return true
	}
	assets, err := h.assetRepo.GetByIDs(c.Request.Context(), imageIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Success: false, Error: dto.ErrorDetail{Code: dto.ErrCodeInternalServerError, Message: "無法檢查圖片"}})
		return false
	}
	if len(assets) != len(imageIDs) {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Success: false, Error: dto.ErrorDetail{Code: dto.ErrCodeImageNotFound, Message: "圖片資源不存在"}})
		return false
	}
	return true
}

func buildCreateProductOptions(c *gin.Context, req dto.CreateProductRequest) ([]model.ProductOptionGroupWithValues, []model.ProductVariant, int, bool, bool) {
	return buildProductOptions(c, req.OptionGroups, req.Variants, req.Quantity, "quantity")
}

func buildProductOptions(c *gin.Context, groupReqs []dto.ProductOptionGroupRequest, variantReqs []dto.ProductVariantRequest, quantity *int, quantityField string) ([]model.ProductOptionGroupWithValues, []model.ProductVariant, int, bool, bool) {
	hasVariants := len(groupReqs) > 0
	if !hasVariants {
		if len(variantReqs) > 0 {
			respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "variants", Message: "無變體商品不可建立 variants"})
			return nil, nil, 0, false, false
		}
		if quantity == nil {
			respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: quantityField, Message: "無變體商品必須提供商品層級 quantity"})
			return nil, nil, 0, false, false
		}
		return nil, nil, *quantity, false, true
	}

	if len(groupReqs) > 2 {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "option_groups", Message: "第一版最多支援兩層自訂規格"})
		return nil, nil, 0, false, false
	}
	if quantity != nil && *quantity > 0 {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: quantityField, Message: "有變體商品不可使用商品層級 quantity"})
		return nil, nil, 0, false, false
	}
	if len(variantReqs) == 0 {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "variants", Message: "有變體商品必須提供 variants"})
		return nil, nil, 0, false, false
	}

	groups, allowed, ok := buildOptionGroups(c, groupReqs)
	if !ok {
		return nil, nil, 0, false, false
	}

	variants := make([]model.ProductVariant, len(variantReqs))
	seen := map[string]struct{}{}
	for i, req := range variantReqs {
		values := normalizeOptionValues(req.OptionValues)
		if len(values) != len(groupReqs) {
			respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{
				Field:   "variants[" + strconv.Itoa(i) + "].option_values",
				Message: "每個 variant 必須提供所有 option_groups 對應的值",
			})
			return nil, nil, 0, false, false
		}
		for groupName, value := range values {
			valueSet, exists := allowed[groupName]
			if !exists {
				respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{
					Field:   "variants[" + strconv.Itoa(i) + "].option_values." + groupName,
					Message: "variant 使用了不存在的 option group",
				})
				return nil, nil, 0, false, false
			}
			if _, exists = valueSet[value]; !exists {
				respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{
					Field:   "variants[" + strconv.Itoa(i) + "].option_values." + groupName,
					Message: "variant 使用了不存在的 option value",
				})
				return nil, nil, 0, false, false
			}
		}

		key := stableVariantKey(values)
		if _, exists := seen[key]; exists {
			c.JSON(http.StatusConflict, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeConflict,
					Message: "變體組合不可重複",
					Fields:  []dto.ValidationFieldError{{Field: "variants[" + strconv.Itoa(i) + "].option_values", Message: "此組合已存在"}},
				},
			})
			return nil, nil, 0, false, false
		}
		seen[key] = struct{}{}

		saleStatus := model.SaleStatusActive
		if req.SaleStatus != "" {
			saleStatus = model.SaleStatus(req.SaleStatus)
		}
		variants[i] = model.ProductVariant{
			ID:           req.ID,
			OptionValues: values,
			Quantity:     req.Quantity,
			SaleStatus:   saleStatus,
		}
	}

	return groups, variants, 0, true, true
}

func buildOptionGroups(c *gin.Context, reqs []dto.ProductOptionGroupRequest) ([]model.ProductOptionGroupWithValues, map[string]map[string]struct{}, bool) {
	groups := make([]model.ProductOptionGroupWithValues, len(reqs))
	allowed := map[string]map[string]struct{}{}
	for i, req := range reqs {
		name := strings.TrimSpace(req.Name)
		if name == "" {
			respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "option_groups[" + strconv.Itoa(i) + "].name", Message: "不可為空"})
			return nil, nil, false
		}
		if _, exists := allowed[name]; exists {
			respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "option_groups[" + strconv.Itoa(i) + "].name", Message: "option group 名稱不可重複"})
			return nil, nil, false
		}

		valueSet := map[string]struct{}{}
		values := make([]model.ProductOptionValue, len(req.Values))
		for j, rawValue := range req.Values {
			value := strings.TrimSpace(rawValue)
			if value == "" {
				respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "option_groups[" + strconv.Itoa(i) + "].values[" + strconv.Itoa(j) + "]", Message: "不可為空"})
				return nil, nil, false
			}
			if _, exists := valueSet[value]; exists {
				respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{Field: "option_groups[" + strconv.Itoa(i) + "].values[" + strconv.Itoa(j) + "]", Message: "同一 option group 的值不可重複"})
				return nil, nil, false
			}
			valueSet[value] = struct{}{}
			values[j] = model.ProductOptionValue{Value: value, Position: j}
		}

		allowed[name] = valueSet
		groups[i] = model.ProductOptionGroupWithValues{
			ProductOptionGroup: model.ProductOptionGroup{Name: name, Position: i},
			Values:             values,
		}
	}
	return groups, allowed, true
}

func normalizeOptionValues(values map[string]string) map[string]string {
	normalized := make(map[string]string, len(values))
	for key, value := range values {
		normalized[strings.TrimSpace(key)] = strings.TrimSpace(value)
	}
	return normalized
}

func stableVariantKey(values map[string]string) string {
	keys := make([]string, 0, len(values))
	for key := range values {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	parts := make([]string, 0, len(keys))
	for _, key := range keys {
		parts = append(parts, key+"="+values[key])
	}
	return strings.Join(parts, "|")
}
