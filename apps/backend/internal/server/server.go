package server

import (
	"context"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(New),
	fx.Provide(func() string {
		return "8002"
	}),
)

type Server struct {
	engine *gin.Engine
	port   string
}

type Params struct {
	fx.In
	Port string
}

func New(p Params) *Server {
	gin.SetMode(gin.ReleaseMode)
	engine := gin.Default()

	//CORS middleware
	engine.Use(corsMiddleware())

	return &Server{
		engine: engine,
		port:   p.Port,
	}
}

func (s *Server) Engine() *gin.Engine {
	return s.engine
}

func (s *Server) Hook() fx.Hook {
	return fx.Hook{
		OnStart: func(ctx context.Context) error {
			go func() {
				if err := s.engine.Run(fmt.Sprintf(":%s", s.port)); err != nil {
					panic(err)
				}
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			return nil
		},
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
