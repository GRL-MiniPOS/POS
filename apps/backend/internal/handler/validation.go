package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"strings"

	"github/pos/internal/dto"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

func respondBindError(c *gin.Context, err error) {
	var validationErrors validator.ValidationErrors
	if errors.As(err, &validationErrors) {
		fields := make([]dto.ValidationFieldError, 0, len(validationErrors))
		for _, fieldErr := range validationErrors {
			field := jsonFieldPath(fieldErr)
			fields = append(fields, dto.ValidationFieldError{
				Field:   field,
				Message: validationMessage(field, fieldErr),
			})
		}
		respondValidationFields(c, "請求參數驗證失敗", fields...)
		return
	}

	var syntaxErr *json.SyntaxError
	if errors.As(err, &syntaxErr) {
		respondValidationFields(c, "JSON 格式錯誤", dto.ValidationFieldError{
			Field:   "body",
			Message: fmt.Sprintf("JSON 格式錯誤，位置 %d", syntaxErr.Offset),
		})
		return
	}

	var typeErr *json.UnmarshalTypeError
	if errors.As(err, &typeErr) {
		respondValidationFields(c, "JSON 欄位型別錯誤", dto.ValidationFieldError{
			Field:   typeErr.Field,
			Message: fmt.Sprintf("型別錯誤，應為 %s", typeErr.Type.String()),
		})
		return
	}

	respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{
		Field:   "body",
		Message: err.Error(),
	})
}

func respondValidationFields(c *gin.Context, message string, fields ...dto.ValidationFieldError) {
	c.JSON(http.StatusBadRequest, dto.ErrorResponse{
		Success: false,
		Error: dto.ErrorDetail{
			Code:    dto.ErrCodeValidationError,
			Message: message,
			Fields:  fields,
		},
	})
}

func validateUUIDField(c *gin.Context, field, value string) bool {
	if _, err := uuid.Parse(value); err != nil {
		respondValidationFields(c, "請求參數驗證失敗", dto.ValidationFieldError{
			Field:   field,
			Message: "必須是合法 UUID",
		})
		return false
	}
	return true
}

func jsonFieldPath(fieldErr validator.FieldError) string {
	namespace := fieldErr.StructNamespace()
	parts := strings.Split(namespace, ".")
	if len(parts) <= 1 {
		return toJSONFieldName(fieldErr.Field())
	}

	path := make([]string, 0, len(parts)-1)
	for _, part := range parts[1:] {
		name, suffix := splitIndexSuffix(part)
		path = append(path, toJSONFieldName(name)+suffix)
	}
	return strings.Join(path, ".")
}

func splitIndexSuffix(part string) (string, string) {
	index := strings.Index(part, "[")
	if index == -1 {
		return part, ""
	}
	return part[:index], part[index:]
}

func toJSONFieldName(field string) string {
	fieldMap := map[string]string{
		"Name":         "name",
		"ParentID":     "parent_id",
		"Order":        "order",
		"CategoryID":   "category_id",
		"Price":        "price",
		"OptionGroups": "option_groups",
		"OptionValues": "option_values",
		"Variants":     "variants",
		"SaleStatus":   "sale_status",
		"HasVariants":  "has_variants",
		"ImageIDs":     "image_ids",
		"ID":           "id",
		"IDs":          "ids",
		"Quantity":     "quantity",
	}
	if jsonName, ok := fieldMap[field]; ok {
		return jsonName
	}
	return strings.ToLower(field)
}

func validationMessage(field string, fieldErr validator.FieldError) string {
	switch fieldErr.Tag() {
	case "required":
		return "為必填欄位"
	case "uuid4":
		return "必須是合法 UUID v4"
	case "min":
		if fieldErr.Kind() == reflect.Slice || fieldErr.Kind() == reflect.Array {
			return fmt.Sprintf("至少需要 %s 筆", fieldErr.Param())
		}
		return fmt.Sprintf("長度或數值不可小於 %s", fieldErr.Param())
	case "max":
		return fmt.Sprintf("長度或數值不可大於 %s", fieldErr.Param())
	case "oneof":
		return fmt.Sprintf("只能是以下其中之一：%s", strings.ReplaceAll(fieldErr.Param(), " ", ", "))
	default:
		return fmt.Sprintf("%s 格式不正確", field)
	}
}
