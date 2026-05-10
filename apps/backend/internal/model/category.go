package model

import "time"

// ProductCategory represents a product category
type ProductCategory struct {
	ID        string    `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	ParentID  *string   `db:"parent_id" json:"parent_id"`
	Order     int       `db:"order" json:"order"`
	Active    bool      `db:"active" json:"active"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}
