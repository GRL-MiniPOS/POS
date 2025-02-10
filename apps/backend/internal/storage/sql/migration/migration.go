package migration

import (
	"embed"

	"github/pos/internal/storage/sql"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"go.uber.org/fx"
)

//go:embed scripts/*.sql
var scripts embed.FS

const version = 20241209

type Params struct {
	fx.In
	Conns *sql.DBConnections
}

// MigrateSchema migrates the database schema to the latest version.
func MigrateSchema(p Params) error {
	driverInstance, err := postgres.WithInstance(p.Conns.ReadWriteDB.DB, &postgres.Config{})
	if err != nil {
		return err
	}

	sourceInstance, err := iofs.New(scripts, "scripts")
	if err != nil {
		return err
	}

	m, err := migrate.NewWithInstance("iofs", sourceInstance, "postgres", driverInstance)
	if err != nil {
		return err
	}

	err = m.Migrate(version) // current version
	if err != nil && err != migrate.ErrNoChange {
		return err
	}

	return sourceInstance.Close()
}
