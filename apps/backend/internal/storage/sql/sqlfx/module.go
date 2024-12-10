package sqlfx

import (
	"github/pos/internal/storage/sql"
	"github/pos/internal/storage/sql/migration"

	"go.uber.org/fx"
)

var Module = fx.Module(
	"sql",
	fx.Provide(
		sql.NewConnections,
	),

	fx.Invoke(migration.MigrateSchema),
)
