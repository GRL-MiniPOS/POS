package driver

import (
	"context"

	"github.com/jmoiron/sqlx"
)

// Driver defines the database driver interface
type Driver interface {
	// Connect establishes a database connection
	Connect(ctx context.Context) (*sqlx.DB, error)
	
	// DSN returns the database connection string
	DSN() string
	
	// Name returns the driver name
	Name() string
} 