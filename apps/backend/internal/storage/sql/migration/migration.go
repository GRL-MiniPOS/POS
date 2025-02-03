package migration

import (
	"embed"
	"fmt"

	"github/pos/internal/config"
	"github/pos/internal/storage/sql"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"go.uber.org/fx"
)

//go:embed scripts/*.sql
var scripts embed.FS

const version = 20241209

type Params struct {
	fx.In
	Conns *sql.DBConnections
	Cfg *config.Config
}

// MigrateSchema migrates the database schema to the latest version.
func MigrateSchema(p Params) error {
	var driverInstance database.Driver
	var err error
	
	switch p.Cfg.Database.Driver {
	case "sqlite":
		driverInstance, err = sqlite3.WithInstance(p.Conns.ReadWriteDB.DB, &sqlite3.Config{})
	case "postgres":
		driverInstance, err = postgres.WithInstance(p.Conns.ReadWriteDB.DB, &postgres.Config{})
	default:
		return fmt.Errorf("unsupported database driver: %s", p.Cfg.Database.Driver)
	}
	
	if err != nil {
		return err
	}

	sourceInstance, err := iofs.New(scripts, "scripts")
	if err != nil {
		return err
	}

	m, err := migrate.NewWithInstance("iofs", sourceInstance, p.Cfg.Database.Driver, driverInstance)
	if err != nil {
		return err
	}

	err = m.Migrate(version) // current version
	if err != nil && err != migrate.ErrNoChange {
		return err
	}

	return sourceInstance.Close()
}
