package sql

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github/pos/internal/config"
	"github/pos/internal/storage/sql/driver"
	"github/pos/internal/storage/sql/driver/postgres"
	"github/pos/internal/storage/sql/driver/sqlite"

	"github.com/jmoiron/sqlx"
	"go.uber.org/fx"
)

func NewDriver(cfg *config.Config) (driver.Driver, error) {
	switch cfg.Database.Driver {
	case "sqlite":
		return sqlite.New(cfg.Database), nil
	case "postgres":
		return postgres.New(cfg.Database), nil
	default:
		return nil, fmt.Errorf("unsupported database driver: %s", cfg.Database.Driver)
	}
}

type DBParams struct {
	fx.In
	Cfg *config.Config
}

type DBResult struct {
	fx.Out

	Conns   *DBConnections
	AppHook fx.Hook `group:"app_hooks"`
}

// DBConnections holds the database connections, because sqlite not support concurrent write,
// we need to separate the read and write connection to promote the read performance.
type DBConnections struct {
	ReadDB       *sqlx.DB
	ReadWriteDB  *sqlx.DB
	ReadExt      sqlx.ExtContext
	ReadWriteExt sqlx.ExtContext
}

func NewConnections(params DBParams) (out DBResult, err error) {
	readWriteDB, err := sqlx.Connect("sqlite", dsn(params.Cfg.Database.StorageFilePath))
	if err != nil {
		return out, fmt.Errorf("failed to initialized read-write db connection: %w", err)
	}

	readDSN := dsn(params.Cfg.Database.StorageFilePath) + "&mode=ro"
	readDB, err := sqlx.Connect("sqlite", readDSN)
	if err != nil {
		return out, fmt.Errorf("failed to initialized read db connection: %w", err)
	}

	readDB.SetMaxOpenConns(10)
	readDB.SetMaxIdleConns(5)
	readWriteDB.SetMaxOpenConns(1)
	readWriteDB.SetMaxIdleConns(1)

	out.Conns = &DBConnections{
		ReadDB:       readDB,
		ReadExt:      readDB,
		ReadWriteDB:  readWriteDB,
		ReadWriteExt: readWriteDB,
	}
	out.AppHook = fx.Hook{
		OnStop: func(context.Context) error {
			return errors.Join(readWriteDB.Close(), readDB.Close())
		},
	}

	return out, err
}

func dsn(dbname string) string {
	return fmt.Sprintf("file:%s?%s", dbname, dsnAttrs())
}

func dsnAttrs() string {
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

type TransactionAbility[T any] interface {
	ProvideExt() sqlx.ExtContext
	Transaction(ctx context.Context, fn func(T) error) error
}

func Transaction[T any, E TransactionAbility[T]](ctx context.Context, instance E, fn func(*sqlx.Tx) error) (err error) {
	db := instance.ProvideExt()
	switch db := db.(type) {
	case *sqlx.Tx:
		return fn(db)
	case *sqlx.DB:
		tx, err := db.BeginTxx(ctx, nil)
		if err != nil {
			return fmt.Errorf("failed to start transaction: %w", err)
		}
		defer func() {
			if p := recover(); p != nil {
				_ = tx.Rollback()
				panic(p) // re-throw the panic after rollback
			} else if err != nil {
				err = errors.Join(tx.Rollback(), err)
			}
		}()

		if err = fn(tx); err != nil {
			return err
		}

		return tx.Commit()
	default:
		return errors.New("unknown sqlx.ExtContext type")
	}
}
