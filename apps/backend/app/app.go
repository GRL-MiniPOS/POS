package app

import (
	"github/pos/internal/config"
	"github/pos/internal/handler"
	"github/pos/internal/server"
	"github/pos/internal/storage"

	"go.uber.org/fx"
)

var Module = fx.Options(
	config.Module,
	storage.Module,
	handler.Module,
	server.Module,
)

func New() *fx.App {
	return fx.New(
		Module,
		fx.Invoke(RegisterHooks),
		fx.Invoke(RegisterRoutes),
	)
}

type HooksParams struct {
	fx.In

	Lifecycle fx.Lifecycle
	AppHooks  []fx.Hook `group:"app_hooks"`
	Server    *server.Server
}

func RegisterHooks(p HooksParams) {
	p.Lifecycle.Append(p.Server.Hook())
	for _, hook := range p.AppHooks {
		p.Lifecycle.Append(hook)
	}
}

type RoutesParams struct {
	fx.In

	Handler *handler.Handler
	Server  *server.Server
}

func RegisterRoutes(params RoutesParams) {
	params.Handler.RegisterRoutes(params.Server.Engine())
}
