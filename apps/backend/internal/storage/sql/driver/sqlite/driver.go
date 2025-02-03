package sqlite

import (
	"context"
	"fmt"
	"github/pos/internal/config"
	"strings"

	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
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
		return nil, fmt.Errorf("failed to connect to sqlite: %w", err)
	}
	
	return db, nil
}

func (d *Driver) DSN() string {
	return fmt.Sprintf("file:%s?%s", d.cfg.StorageFilePath, d.dsnAttrs())
}

func (d *Driver) Name() string {
	return "sqlite"
}

func (d *Driver) dsnAttrs() string {
	attrs := []string{
		"_pragma", "foreign_keys(1)",
		"_pragma", "busy_timeout(5000)",
		"_pragma", "journal_mode(WAL)",
		"_pragma", "synchronous(IMMEDIATE)",
		"_time_format", "sqlite",
	}

	b := strings.Builder{}
	for i := 0; i < len(attrs); i += 2 {
		b.WriteString(attrs[i])
		b.WriteString("=")
		b.WriteString(attrs[i+1])
		b.WriteString("&")
	}

	return strings.TrimSuffix(b.String(), "&")
} 