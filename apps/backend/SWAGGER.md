# Swagger API 文檔

## 📚 簡介

本專案使用 Swagger (OpenAPI) 自動產生完整的 API 文檔，包含所有端點的詳細說明、請求/響應格式和範例資料。

## 🚀 啟動服務後訪問 Swagger UI

### 1. 啟動後端服務

```bash
cd /Users/apple/POS/apps/backend
GO_ENV=development go run main.go
```

### 2. 訪問 Swagger UI

服務啟動後，在瀏覽器打開：

```
http://localhost:8002/swagger/index.html
```

## 📖 可用的 API 端點

### System
- `GET /api/health` - 健康檢查

### Upload
- `POST /api/upload` - 上傳圖片

### Categories (分類管理)
- `GET /api/product-categories` - 取得商品分類列表
- `POST /api/product-categories` - 新增商品分類
- `DELETE /api/product-categories/{id}` - 刪除商品分類

### Products (商品管理)
- `GET /api/products` - 取得商品列表（支援篩選、分頁）
- `GET /api/products/{id}` - 取得單一商品
- `POST /api/products` - 新增商品
- `PATCH /api/products/{id}` - 更新商品
- `DELETE /api/products/{id}` - 刪除商品
- `POST /api/products/batch-delete` - 批量刪除商品
- `GET /api/product-options` - 取得所有商品選項

### Orders (訂單管理)
- `POST /api/orders` - 新增訂單

## 🎯 如何使用 Swagger UI

### 1. **瀏覽 API**
- 點擊任何端點展開詳細資訊
- 查看請求參數、響應格式、錯誤代碼

### 2. **測試 API**
1. 點擊 "Try it out" 按鈕
2. 填寫必要的參數
3. 點擊 "Execute" 執行請求
4. 查看回應結果

### 3. **範例數據**
所有 DTO 都包含 `example` 標籤，Swagger 會自動填充範例數據。

## 📝 完整的使用流程範例

### Step 1: 新增分類

```bash
POST /api/product-categories
{
  "name": "上衣",
  "parent_id": null,
  "order": 1
}
```

**回傳**:
```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "message": "分類新增成功"
  }
}
```

### Step 2: 上傳圖片

```bash
POST /api/upload
Files: product-image.jpg
```

**回傳**:
```json
{
  "success": true,
  "data": [
    {
      "id": "bdf73d34-54d4-4e3f-b47b-2fcbfc33a51f",
      "name": "product-image.jpg",
      "url": "http://localhost:8002/assets/2025/01/...",
      ...
    }
  ]
}
```

### Step 3: 新增商品

使用上面取得的 `category_id` 和 `asset_id`:

```bash
POST /api/products
{
  "name": "經典白色T恤",
  "category_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "price": "590",
  "option_groups": [
    {"name": "顏色", "values": ["白色"]},
    {"name": "尺寸", "values": ["S", "M", "L"]}
  ],
  "variants": [
    {"option_values": {"顏色": "白色", "尺寸": "S"}, "quantity": 0, "sale_status": "active"},
    {"option_values": {"顏色": "白色", "尺寸": "M"}, "quantity": 15, "sale_status": "active"},
    {"option_values": {"顏色": "白色", "尺寸": "L"}, "quantity": 8, "sale_status": "active"}
  ],
  "image_ids": ["bdf73d34-54d4-4e3f-b47b-2fcbfc33a51f"]
}
```

### Step 4: 查詢商品列表

```bash
GET /api/products?page=1&limit=10&stockStatus=in-stock
```

## 🔧 重新生成 Swagger 文檔

當你修改 API 或添加新端點時，需要重新生成文檔：

```bash
cd /Users/apple/POS/apps/backend
go run github.com/swaggo/swag/cmd/swag@v1.16.6 init -g main.go --output ./docs
```

## 📂 Swagger 檔案說明

- `/docs/docs.go` - Go 程式碼格式的文檔
- `/docs/swagger.json` - JSON 格式的 OpenAPI 規格
- `/docs/swagger.yaml` - YAML 格式的 OpenAPI 規格

## 🎨 Swagger 註解格式

範例：

```go
// CreateProduct godoc
// @Summary      新增商品
// @Description  新增一個新商品，包含 option_groups、variants 和圖片
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        request  body      dto.CreateProductRequest  true  "商品資訊"
// @Success      200      {object}  dto.SuccessResponse{data=dto.CreateProductResponse}
// @Failure      400      {object}  dto.ErrorResponse
// @Router       /products [post]
func (h *Handler) CreateProduct(c *gin.Context) {
    // ...
}
```

## 🌐 其他格式訪問

### JSON 格式
```
http://localhost:8002/swagger/doc.json
```

### YAML 格式
```
在瀏覽器訪問後可以下載 swagger.yaml
```

## 💡 提示

1. **前端開發者**: 可以直接在 Swagger UI 中測試所有 API，無需寫任何程式碼
2. **自動補全**: Swagger UI 會根據 example 標籤自動填充範例數據
3. **錯誤處理**: 每個 API 都列出了可能的錯誤代碼和說明
4. **即時測試**: 修改參數後立即執行，查看實際響應

## 📱 手機/平板訪問

Swagger UI 是響應式設計，可以在手機或平板上使用。只需確保設備與後端服務在同一網路，並將 `localhost` 改為伺服器的 IP 地址：

```
http://<your-server-ip>:8002/swagger/index.html
```

---

**Swagger 版本**: OpenAPI 2.0
**UI 版本**: Swagger UI (embedded)
