package config

import (
	"fmt"
	"log"
	"os"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
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
	Host            string `env:"HOST"                envDefault:"localhost"`
	Port            string `env:"PORT"                envDefault:"5432"`
	User            string `env:"USER"                envDefault:"postgres"`
	Password        string `env:"PASSWORD"            envDefault:""`
	Name            string `env:"NAME"                envDefault:"pos"`
	SSLMode         string `env:"SSL_MODE"            envDefault:"disable"`
	StorageFilePath string `env:"STORAGE_FILE_PATH"   envDefault:"./data/pos.db"`
}

// New returns a new Config struct with values from environment variables.
func New() (*Config, error) {
	goEnv := os.Getenv("GO_ENV")
	if goEnv == "" {
		goEnv = "development"
	}

	// according to environment load the corresponding .env file
	envFile := fmt.Sprintf(".env.%s", goEnv)
	if err := godotenv.Load(envFile); err != nil {
		log.Printf("Warning: %s not found, falling back to .env\n", envFile)
		if err := godotenv.Load(); err != nil {
			log.Printf("Warning: .env not found, using environment variables and defaults")
		}
	}

	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		return nil, fmt.Errorf("error parsing config: %w", err)
	}
	applyPostgresEnvFallbacks(&cfg.Database)

	fmt.Printf(
		"Database Config: host=%s port=%s name=%s sslmode=%s auto_migrate=%t\n",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.Name,
		cfg.Database.SSLMode,
		cfg.Database.AutoMigrate,
	)

	return &cfg, nil
}

func applyPostgresEnvFallbacks(db *DatabaseConfig) {
	if os.Getenv("DATABASE_HOST") == "" {
		db.Host = envOrDefault("PGHOST", db.Host)
	}
	if os.Getenv("DATABASE_PORT") == "" {
		db.Port = envOrDefault("PGPORT", db.Port)
	}
	if os.Getenv("DATABASE_USER") == "" {
		db.User = envOrDefault("PGUSER", db.User)
	}
	if os.Getenv("DATABASE_PASSWORD") == "" {
		db.Password = envOrDefault("PGPASSWORD", db.Password)
	}
	if os.Getenv("DATABASE_NAME") == "" {
		db.Name = envOrDefault("PGDATABASE", db.Name)
	}
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
