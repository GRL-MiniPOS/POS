package handler

import (
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github/pos/internal/dto"
	"github/pos/internal/model"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	maxUploadSize = 10 << 20 // 10MB
)

var allowedMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

// Upload godoc
// @Summary      上傳圖片
// @Description  上傳一個或多個圖片檔案，支援 JPEG, PNG, GIF, WebP 格式，單檔最大 10MB
// @Tags         Upload
// @Accept       multipart/form-data
// @Produce      json
// @Param        files  formData  file  true  "圖片檔案（可多選）"
// @Success      200    {object}  dto.UploadAssetsResponse  "成功"
// @Failure      400    {object}  dto.ErrorResponse  "檔案格式不支援或檔案過大"
// @Failure      500    {object}  dto.ErrorResponse  "伺服器錯誤"
// @Router       /upload [post]
func (h *Handler) Upload(c *gin.Context) {
	// Parse multipart form
	form, err := c.MultipartForm()
	if err != nil {
		respondValidationFields(c, "無法解析上傳檔案", dto.ValidationFieldError{
			Field:   "files",
			Message: "請使用 multipart/form-data 並以 files 欄位上傳圖片",
		})
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		respondValidationFields(c, "未提供檔案", dto.ValidationFieldError{
			Field:   "files",
			Message: "至少需要上傳 1 個圖片檔案",
		})
		return
	}

	var assets []model.Asset
	baseURL := fmt.Sprintf("http://%s", c.Request.Host)

	for _, fileHeader := range files {
		// Check file size
		if fileHeader.Size > maxUploadSize {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeFileTooLarge,
					Message: "檔案超過 10MB 限制",
					Fields: []dto.ValidationFieldError{{
						Field:   "files",
						Message: "單檔不可超過 10MB",
					}},
				},
			})
			return
		}

		// Open file
		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeInternalServerError,
					Message: "無法讀取檔案",
				},
			})
			return
		}
		defer file.Close()

		// Detect image dimensions and format
		imgConfig, format, err := image.DecodeConfig(file)
		if err != nil {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeUnsupportedFileType,
					Message: "不支援的圖片格式",
					Fields: []dto.ValidationFieldError{{
						Field:   "files",
						Message: "只支援 JPEG、PNG、GIF、WebP 圖片",
					}},
				},
			})
			return
		}

		// Check MIME type
		mimeType := fmt.Sprintf("image/%s", format)
		if !allowedMimeTypes[mimeType] {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeUnsupportedFileType,
					Message: "不支援的檔案格式",
					Fields: []dto.ValidationFieldError{{
						Field:   "files",
						Message: "只支援 JPEG、PNG、GIF、WebP 圖片",
					}},
				},
			})
			return
		}

		// Reset file pointer
		file.Seek(0, 0)

		// Generate unique filename
		now := time.Now()
		year := now.Format("2006")
		month := now.Format("01")
		ext := filepath.Ext(fileHeader.Filename)
		uniqueID := uuid.New().String()
		filename := fmt.Sprintf("%s%s", uniqueID, ext)

		// Create directory structure
		uploadDir := filepath.Join("assets", year, month)
		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeInternalServerError,
					Message: "無法建立儲存目錄",
				},
			})
			return
		}

		// Save file
		filePath := filepath.Join(uploadDir, filename)
		if err := c.SaveUploadedFile(fileHeader, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeInternalServerError,
					Message: "無法儲存檔案",
				},
			})
			return
		}

		// Create asset record
		url := fmt.Sprintf("%s/assets/%s/%s/%s", baseURL, year, month, filename)
		asset := &model.Asset{
			Name:     fileHeader.Filename,
			Mime:     mimeType,
			Size:     fileHeader.Size,
			Width:    imgConfig.Width,
			Height:   imgConfig.Height,
			URL:      url,
			ThumbURL: nil, // User will upload thumb separately
		}

		// Save to database
		err = h.assetRepo.Create(c.Request.Context(), asset)
		if err != nil {
			// Clean up uploaded file
			os.Remove(filePath)
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Success: false,
				Error: dto.ErrorDetail{
					Code:    dto.ErrCodeInternalServerError,
					Message: "無法儲存資產記錄",
				},
			})
			return
		}

		assets = append(assets, *asset)
	}

	// Convert to response DTOs
	assetResponses := dto.ToAssetResponses(assets)
	total := len(assetResponses)

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Data:    assetResponses,
		Total:   &total,
	})
}
