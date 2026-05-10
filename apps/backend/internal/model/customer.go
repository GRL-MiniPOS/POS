package model

import "time"

// Customer represents a customer
type Customer struct {
	ID        string    `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	Phone     *string   `db:"phone" json:"phone"`
	Address   *string   `db:"address" json:"address"`
	Info      *string   `db:"info" json:"info"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}
