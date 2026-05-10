package dto

// SuccessResponse represents a successful API response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Total   *int        `json:"total,omitempty"`
}

// ErrorResponse represents an error API response
type ErrorResponse struct {
	Success bool        `json:"success" example:"false"`
	Error   ErrorDetail `json:"error"`
}

// ErrorDetail contains error information
type ErrorDetail struct {
	Code      string                 `json:"code" example:"VALIDATION_ERROR"`
	Message   string                 `json:"message" example:"請求參數驗證失敗"`
	Fields    []ValidationFieldError `json:"fields,omitempty"`
	FailedIDs []string               `json:"failed_ids,omitempty" example:"6d1fb22a-2eb3-4a8a-9750-b4d63b56b971"`
}

// ValidationFieldError describes one invalid request field.
type ValidationFieldError struct {
	Field   string `json:"field" example:"image_ids[0]"`
	Message string `json:"message" example:"必須是合法 UUID"`
}

// PaginationResponse represents pagination information
type PaginationResponse struct {
	CurrentPage int `json:"current_page" example:"1"`
	TotalPages  int `json:"total_pages" example:"5"`
	PerPage     int `json:"per_page" example:"10"`
	TotalItems  int `json:"total_items" example:"42"`
}

// Error codes
const (
	ErrCodeValidationError      = "VALIDATION_ERROR"
	ErrCodeUnauthorized         = "UNAUTHORIZED"
	ErrCodeForbidden            = "FORBIDDEN"
	ErrCodeNotFound             = "NOT_FOUND"
	ErrCodeInternalServerError  = "INTERNAL_SERVER_ERROR"
	ErrCodeCategoryNotFound     = "CATEGORY_NOT_FOUND"
	ErrCodeCategoryInUse        = "CATEGORY_IN_USE"
	ErrCodeCategoryNameExists   = "CATEGORY_NAME_EXISTS"
	ErrCodeParentNotFound       = "PARENT_NOT_FOUND"
	ErrCodeProductNotFound      = "PRODUCT_NOT_FOUND"
	ErrCodeProductInUse         = "PRODUCT_IN_USE"
	ErrCodeImageNotFound        = "IMAGE_NOT_FOUND"
	ErrCodeSomeProductsNotFound = "SOME_PRODUCTS_NOT_FOUND"
	ErrCodeSomeProductsInUse    = "SOME_PRODUCTS_IN_USE"
	ErrCodeConflict             = "CONFLICT"
	ErrCodeBusinessRuleError    = "BUSINESS_RULE_ERROR"
	ErrCodeUnsupportedFileType  = "UNSUPPORTED_FILE_TYPE"
	ErrCodeFileTooLarge         = "FILE_TOO_LARGE"
)
