package storage

import (
	"github/pos/internal/storage/sql/sqlfx"

	"go.uber.org/fx"
)

var Module = fx.Module(
	"storage",
	fx.Options(
		sqlfx.Module,
	),
)
