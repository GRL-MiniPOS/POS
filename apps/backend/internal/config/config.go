package config

import (
	"github.com/caarlos0/env/v11"
	"go.uber.org/fx"
)

// Module provides a Config struct with values from environment variables.
var Module = fx.Provide(New)

// Config holds configuration for the application.
type Config struct {
	AppMode  string         `env:"APP_MODE"              envDefault:"development"`
	Port     string         `env:"PORT"                  envDefault:"8002"`
	Database DatabaseConfig `envPrefix:"DATABASE_"`
}

func (c Config) IsDevelopmentMode() bool {
	return c.AppMode == "development"
}

type DatabaseConfig struct {
	AutoMigrate     bool   `env:"AUTO_MIGRATE"        envDefault:"true"`
	StorageFilePath string `env:"STORAGE_FILE_PATH"   envDefault:"./data/pos.db"`
}

// New returns a new Config struct with values from environment variables.
func New() *Config {
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		panic(err)
	}
	return &cfg
}
