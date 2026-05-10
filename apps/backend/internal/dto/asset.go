package dto

import "github/pos/internal/model"

// AssetResponse represents an asset in the response
type AssetResponse struct {
	ID        string  `json:"id" example:"bdf73d34-54d4-4e3f-b47b-2fcbfc33a51f"`
	Name      string  `json:"name" example:"product-a.jpg"`
	Mime      string  `json:"mime" example:"image/jpeg"`
	Size      int64   `json:"size" example:"523412"`
	Width     int     `json:"width" example:"1600"`
	Height    int     `json:"height" example:"1200"`
	URL       string  `json:"url" example:"http://localhost:8002/assets/2026/05/product-a.jpg"`
	ThumbURL  *string `json:"thumb_url" extensions:"x-nullable"`
	CreatedAt string  `json:"created_at" example:"2026-05-07T10:00:00Z"`
}

// UploadAssetsResponse represents a successful upload response
type UploadAssetsResponse struct {
	Success bool            `json:"success" example:"true"`
	Data    []AssetResponse `json:"data"`
	Total   int             `json:"total" example:"2"`
}

// ToAssetResponse converts a model.Asset to AssetResponse
func ToAssetResponse(a *model.Asset) AssetResponse {
	return AssetResponse{
		ID:        a.ID,
		Name:      a.Name,
		Mime:      a.Mime,
		Size:      a.Size,
		Width:     a.Width,
		Height:    a.Height,
		URL:       a.URL,
		ThumbURL:  a.ThumbURL,
		CreatedAt: a.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}
}

// ToAssetResponses converts a slice of model.Asset to []AssetResponse
func ToAssetResponses(assets []model.Asset) []AssetResponse {
	result := make([]AssetResponse, len(assets))
	for i, a := range assets {
		result[i] = ToAssetResponse(&a)
	}
	return result
}
