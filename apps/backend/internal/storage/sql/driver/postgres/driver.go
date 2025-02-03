package postgres

import (
	"context"
	"fmt"
	"github/pos/internal/config"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Driver struct {
	cfg config.DatabaseConfig
}

func New(cfg config.DatabaseConfig) *Driver {
	return &Driver{cfg: cfg}
}

func (d *Driver) Connect(ctx context.Context) (*sqlx.DB, error) {
	db, err := sqlx.ConnectContext(ctx, d.Name(), d.DSN())
	if err != nil {
		return nil, fmt.Errorf("failed to connect to postgres: %w", err)
	}
	
	return db, nil
}

func (d *Driver) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		d.cfg.Host,
		d.cfg.Port,
		d.cfg.User,
		d.cfg.Password,
		d.cfg.DBName,
		d.cfg.SSLMode,
	)
}

func (d *Driver) Name() string {
	return "postgres"
} 