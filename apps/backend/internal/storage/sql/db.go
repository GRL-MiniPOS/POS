package sql

import (
	"context"
	"errors"
	"fmt"

	"github/pos/internal/config"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"go.uber.org/fx"
)

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
	connStr := dsn(params.Cfg.Database)

	readWriteDB, err := sqlx.Connect("postgres", connStr)
	if err != nil {
		return out, fmt.Errorf("failed to initialized read-write db connection: %w", err)
	}

	// PostgreSQL 支援並發，所以可以共用同一個連接
	readDB := readWriteDB

	// PostgreSQL 建議的連接池設定
	readDB.SetMaxOpenConns(25)
	readDB.SetMaxIdleConns(5)

	out.Conns = &DBConnections{
		ReadDB:       readDB,
		ReadExt:      readDB,
		ReadWriteDB:  readWriteDB,
		ReadWriteExt: readWriteDB,
	}
	out.AppHook = fx.Hook{
		OnStop: func(context.Context) error {
			return readWriteDB.Close()
		},
	}

	return out, err
}

func dsn(dbConfig config.DatabaseConfig) string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dbConfig.Host,
		dbConfig.Port,
		dbConfig.User,
		dbConfig.Password,
		dbConfig.Name,
		dbConfig.SSLMode,
	)
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
