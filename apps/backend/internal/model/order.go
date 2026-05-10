package model

import "time"

// OrderStatus represents the status of an order
type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusShipped    OrderStatus = "shipped"
	OrderStatusCompleted  OrderStatus = "completed"
	OrderStatusCancelled  OrderStatus = "cancelled"
)

// Order represents a customer order
type Order struct {
	ID            string      `db:"id" json:"id"`
	CustomerID    *string     `db:"customer_id" json:"customer_id"`
	DiscountID    *string     `db:"discount_id" json:"discount_id"`
	OrderDate     time.Time   `db:"order_date" json:"order_date"`
	Payment       *string     `db:"payment" json:"payment"`
	Source        *string     `db:"source" json:"source"`
	TotalPrice    int64       `db:"total_price" json:"total_price"`
	OriginalPrice int64       `db:"original_price" json:"original_price"`
	Status        OrderStatus `db:"status" json:"status"`
	CreatedAt     time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time   `db:"updated_at" json:"updated_at"`
}

// OrderItem represents an item in an order
type OrderItem struct {
	ID                     string    `db:"id" json:"id"`
	OrderID                string    `db:"order_id" json:"order_id"`
	ProductID              *string   `db:"product_id" json:"product_id"`
	ProductSpecificationID *string   `db:"product_specification_id" json:"product_specification_id"`
	ProductVariantID       *string   `db:"product_variant_id" json:"product_variant_id"`
	Quantity               int       `db:"quantity" json:"quantity"`
	UnitPrice              int64     `db:"unit_price" json:"unit_price"`
	Subtotal               int64     `db:"subtotal" json:"subtotal"`
	CreatedAt              time.Time `db:"created_at" json:"created_at"`
}
