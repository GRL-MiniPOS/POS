package app

import (
	"github/pos/internal/config"
	"github/pos/internal/storage"

	"go.uber.org/fx"
)

var Module = fx.Options(
	config.Module,
	storage.Module,
)

func New() *fx.App {
	return fx.New(
		Module,
		fx.Invoke(RegisterHooks),
	)
}

type HooksParams struct {
	fx.In

	Lifecycle fx.Lifecycle
	AppHooks  []fx.Hook `group:"app_hooks"`
}

func RegisterHooks(params HooksParams) {
	for _, hook := range params.AppHooks {
		params.Lifecycle.Append(hook)
	}
}
