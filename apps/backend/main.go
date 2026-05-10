package main

import (
	"github/pos/app"
	_ "github/pos/docs" // Swagger docs
)

// @title           POS System API
// @version         1.0
// @description     完整的 POS 系統後端 API，包含商品管理、分類管理、庫存管理等功能
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.email  support@pos.com

// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT

// @host      localhost:8002
// @BasePath  /api

// @schemes http https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	app.New().Run()
}
