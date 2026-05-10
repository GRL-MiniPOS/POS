package model

import (
	"database/sql"
	"encoding/json"
	"time"
)

type SaleStatus string

const (
	SaleStatusActive   SaleStatus = "active"
	SaleStatusInactive SaleStatus = "inactive"
)

// Product represents a product
type Product struct {
	ID          string     `db:"id" json:"id"`
	Name        string     `db:"name" json:"name"`
	CategoryID  *string    `db:"category_id" json:"category_id"`
	Price       int64      `db:"price" json:"price"`
	Quantity    int        `db:"quantity" json:"quantity"`
	SaleStatus  SaleStatus `db:"sale_status" json:"sale_status"`
	HasVariants bool       `db:"has_variants" json:"has_variants"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at" json:"updated_at"`
}

type ProductOptionGroup struct {
	ID        string       `db:"id" json:"id"`
	ProductID string       `db:"product_id" json:"product_id"`
	Name      string       `db:"name" json:"name"`
	Position  int          `db:"position" json:"position"`
	CreatedAt time.Time    `db:"created_at" json:"created_at"`
	UpdatedAt time.Time    `db:"updated_at" json:"updated_at"`
	DeletedAt sql.NullTime `db:"deleted_at" json:"deleted_at,omitempty"`
}

type ProductOptionValue struct {
	ID            string       `db:"id" json:"id"`
	OptionGroupID string       `db:"option_group_id" json:"option_group_id"`
	Value         string       `db:"value" json:"value"`
	Position      int          `db:"position" json:"position"`
	CreatedAt     time.Time    `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time    `db:"updated_at" json:"updated_at"`
	DeletedAt     sql.NullTime `db:"deleted_at" json:"deleted_at,omitempty"`
}

type ProductOptionGroupWithValues struct {
	ProductOptionGroup
	Values []ProductOptionValue `json:"values"`
}

type ProductVariant struct {
	ID               string            `db:"id" json:"id"`
	ProductID        string            `db:"product_id" json:"product_id"`
	OptionValues     map[string]string `db:"-" json:"option_values"`
	OptionValuesJSON []byte            `db:"option_values" json:"-"`
	Quantity         int               `db:"quantity" json:"quantity"`
	SaleStatus       SaleStatus        `db:"sale_status" json:"sale_status"`
	CreatedAt        time.Time         `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time         `db:"updated_at" json:"updated_at"`
	DeletedAt        sql.NullTime      `db:"deleted_at" json:"deleted_at,omitempty"`
}

func (v *ProductVariant) EncodeOptionValues() error {
	if v.OptionValues == nil {
		v.OptionValues = map[string]string{}
	}
	data, err := json.Marshal(v.OptionValues)
	if err != nil {
		return err
	}
	v.OptionValuesJSON = data
	return nil
}

func (v *ProductVariant) DecodeOptionValues() error {
	if len(v.OptionValuesJSON) == 0 {
		v.OptionValues = map[string]string{}
		return nil
	}
	return json.Unmarshal(v.OptionValuesJSON, &v.OptionValues)
}

// ProductImage represents the relationship between products and images
type ProductImage struct {
	ID           string    `db:"id" json:"id"`
	ProductID    string    `db:"product_id" json:"product_id"`
	AssetID      *string   `db:"asset_id" json:"asset_id"`
	DisplayOrder int       `db:"display_order" json:"display_order"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

// ProductWithDetails represents a product with full details including category, specs, and images
type ProductWithDetails struct {
	Product
	Category     *ProductCategory               `json:"category,omitempty"`
	OptionGroups []ProductOptionGroupWithValues `json:"option_groups"`
	Variants     []ProductVariant               `json:"variants"`
	Images       []AssetWithOrder               `json:"images,omitempty"`
	Stock        int                            `json:"stock"`
}

// AssetWithOrder represents an asset with display order for product images
type AssetWithOrder struct {
	Asset
	DisplayOrder int `json:"display_order"`
}
