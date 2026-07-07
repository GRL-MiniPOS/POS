package handler

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"image"
	"image/color"
	"image/jpeg"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
	"time"

	"github/pos/internal/repository"
	possql "github/pos/internal/storage/sql"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

const (
	testCategoryID = "8594e2e0-4b1e-4224-8f1e-2310419cf661"
	testProductID  = "6d1fb22a-2eb3-4a8a-9750-b4d63b56b971"
	testAssetID    = "34073104-90e7-4177-977a-3efeed4cff76"
	testSpecID     = "9b0d5d3d-6e44-43ad-9952-d80f9204fd9f"
	testVariantID  = "7a41ca47-7979-4b85-a7b9-6ca7c75e75cc"
)

type apiTestServer struct {
	router *gin.Engine
	db     *sql.DB
	mock   sqlmock.Sqlmock
}

func newAPITestServer(t *testing.T) *apiTestServer {
	t.Helper()

	gin.SetMode(gin.TestMode)

	db, mock, err := sqlmock.New(sqlmock.MonitorPingsOption(true))
	if err != nil {
		t.Fatalf("new sqlmock: %v", err)
	}

	sqlxDB := sqlx.NewDb(db, "postgres")
	h := &Handler{
		db: &possql.DBConnections{
			ReadDB:       sqlxDB,
			ReadWriteDB:  sqlxDB,
			ReadExt:      sqlxDB,
			ReadWriteExt: sqlxDB,
		},
		categoryRepo: repository.NewCategoryRepository(sqlxDB),
		assetRepo:    repository.NewAssetRepository(sqlxDB),
		productRepo:  repository.NewProductRepository(sqlxDB),
	}

	router := gin.New()
	h.RegisterRoutes(router)

	server := &apiTestServer{router: router, db: db, mock: mock}
	t.Cleanup(func() {
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Fatalf("unmet sql expectations: %v", err)
		}
		_ = db.Close()
	})

	return server
}

func performJSONRequest(router http.Handler, method, path, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	return rr
}

func decodeBody(t *testing.T, rr *httptest.ResponseRecorder) map[string]any {
	t.Helper()

	var body map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body %q: %v", rr.Body.String(), err)
	}
	return body
}

func expectCategoryByID(mock sqlmock.Sqlmock, id string) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, parent_id, "order", active, created_at, updated_at
	          FROM product_categories WHERE id = $1`)).
		WithArgs(id).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "parent_id", "order", "active", "created_at", "updated_at"}).
			AddRow(id, "上衣", nil, 1, true, time.Now(), time.Now()))
}

func expectProductNotFound(mock sqlmock.Sqlmock, id string) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, category_id, price, quantity, sale_status, has_variants, created_at, updated_at
	          FROM products WHERE id = $1`)).
		WithArgs(id).
		WillReturnError(sql.ErrNoRows)
}

func expectProductByID(mock sqlmock.Sqlmock, id string) {
	expectProductByIDWithStock(mock, id, 10)
}

func expectProductByIDWithStock(mock sqlmock.Sqlmock, id string, quantity int) {
	now := time.Now()
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, category_id, price, quantity, sale_status, has_variants, created_at, updated_at
	          FROM products WHERE id = $1`)).
		WithArgs(id).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "category_id", "price", "quantity", "sale_status", "has_variants", "created_at", "updated_at"}).
			AddRow(id, "經典白色T恤", testCategoryID, int64(590), quantity, "active", false, now, now))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, parent_id, "order", active, created_at, updated_at
		                  FROM product_categories WHERE id = $1`)).
		WithArgs(testCategoryID).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "parent_id", "order", "active", "created_at", "updated_at"}).
			AddRow(testCategoryID, "上衣", nil, 1, true, now, now))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, product_id, name, position, created_at, updated_at, deleted_at
	               FROM product_option_groups
	               WHERE product_id = $1 AND deleted_at IS NULL
	               ORDER BY position ASC, created_at ASC`)).
		WithArgs(id).
		WillReturnRows(sqlmock.NewRows([]string{"id", "product_id", "name", "position", "created_at", "updated_at", "deleted_at"}))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, product_id, option_values, quantity, sale_status, created_at, updated_at, deleted_at
	                 FROM product_variants
	                 WHERE product_id = $1 AND deleted_at IS NULL
	                 ORDER BY created_at ASC`)).
		WithArgs(id).
		WillReturnRows(sqlmock.NewRows([]string{"id", "product_id", "option_values", "quantity", "sale_status", "created_at", "updated_at", "deleted_at"}))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT a.id, a.name, a.mime, a.size, a.width, a.height, a.url, a.thumb_url, a.created_at, pi.display_order
	                FROM assets a
	                INNER JOIN product_images pi ON a.id = pi.asset_id
	                WHERE pi.product_id = $1
	                ORDER BY pi.display_order ASC`)).
		WithArgs(id).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "mime", "size", "width", "height", "url", "thumb_url", "created_at", "display_order"}))
}

func expectProductByIDWithVariant(mock sqlmock.Sqlmock, id string, quantity int, productSaleStatus string, variantSaleStatus string) {
	now := time.Now()
	optionGroupID := "11111111-1111-4111-8111-111111111111"
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, category_id, price, quantity, sale_status, has_variants, created_at, updated_at
	          FROM products WHERE id = $1`)).
		WithArgs(id).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "category_id", "price", "quantity", "sale_status", "has_variants", "created_at", "updated_at"}).
			AddRow(id, "經典白色T恤", testCategoryID, int64(590), 0, productSaleStatus, true, now, now))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, parent_id, "order", active, created_at, updated_at
		                  FROM product_categories WHERE id = $1`)).
		WithArgs(testCategoryID).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "parent_id", "order", "active", "created_at", "updated_at"}).
			AddRow(testCategoryID, "上衣", nil, 1, true, now, now))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, product_id, name, position, created_at, updated_at, deleted_at
	               FROM product_option_groups
	               WHERE product_id = $1 AND deleted_at IS NULL
	               ORDER BY position ASC, created_at ASC`)).
		WithArgs(id).
		WillReturnRows(sqlmock.NewRows([]string{"id", "product_id", "name", "position", "created_at", "updated_at", "deleted_at"}).
			AddRow(optionGroupID, id, "尺寸", 0, now, now, nil))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, option_group_id, value, position, created_at, updated_at, deleted_at
		                FROM product_option_values
		                WHERE option_group_id = $1 AND deleted_at IS NULL
		                ORDER BY position ASC, created_at ASC`)).
		WithArgs(optionGroupID).
		WillReturnRows(sqlmock.NewRows([]string{"id", "option_group_id", "value", "position", "created_at", "updated_at", "deleted_at"}).
			AddRow("22222222-2222-4222-8222-222222222222", optionGroupID, "S", 0, now, now, nil))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, product_id, option_values, quantity, sale_status, created_at, updated_at, deleted_at
	                 FROM product_variants
	                 WHERE product_id = $1 AND deleted_at IS NULL
	                 ORDER BY created_at ASC`)).
		WithArgs(id).
		WillReturnRows(sqlmock.NewRows([]string{"id", "product_id", "option_values", "quantity", "sale_status", "created_at", "updated_at", "deleted_at"}).
			AddRow(testVariantID, id, []byte(`{"尺寸":"S"}`), quantity, variantSaleStatus, now, now, nil))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT a.id, a.name, a.mime, a.size, a.width, a.height, a.url, a.thumb_url, a.created_at, pi.display_order
	                FROM assets a
	                INNER JOIN product_images pi ON a.id = pi.asset_id
	                WHERE pi.product_id = $1
	                ORDER BY pi.display_order ASC`)).
		WithArgs(id).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "mime", "size", "width", "height", "url", "thumb_url", "created_at", "display_order"}))
}

func TestHealth(t *testing.T) {
	server := newAPITestServer(t)
	server.mock.ExpectPing()

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	server.router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
	body := decodeBody(t, rr)
	if body["db_status"] != "up" {
		t.Fatalf("expected db_status up, got %#v", body["db_status"])
	}
}

func TestGetCategories(t *testing.T) {
	server := newAPITestServer(t)
	now := time.Now()
	server.mock.ExpectQuery(`SELECT id, name, parent_id, "order", active, created_at, updated_at FROM product_categories WHERE active = \$1 ORDER BY "order" ASC, created_at ASC`).
		WithArgs(true).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "parent_id", "order", "active", "created_at", "updated_at"}).
			AddRow(testCategoryID, "上衣", nil, 1, true, now, now))

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/product-categories", nil)
	server.router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
	body := decodeBody(t, rr)
	if body["total"].(float64) != 1 {
		t.Fatalf("expected total 1, got %#v", body["total"])
	}
}

func TestGetCategoriesValidation(t *testing.T) {
	server := newAPITestServer(t)

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/product-categories?active=yes", nil)
	server.router.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestCreateCategory(t *testing.T) {
	server := newAPITestServer(t)
	now := time.Now()
	server.mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, parent_id, "order", active, created_at, updated_at
	          FROM product_categories WHERE name = $1`)).
		WithArgs("上衣").
		WillReturnError(sql.ErrNoRows)
	server.mock.ExpectQuery(regexp.QuoteMeta(`SELECT MAX("order") FROM product_categories WHERE parent_id IS NULL`)).
		WillReturnRows(sqlmock.NewRows([]string{"max"}).AddRow(nil))
	server.mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO product_categories (name, parent_id, "order", active)
	          VALUES ($1, $2, $3, $4)
	          RETURNING id, created_at, updated_at`)).
		WithArgs("上衣", nil, 1, true).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).AddRow(testCategoryID, now, now))

	rr := performJSONRequest(server.router, http.MethodPost, "/api/product-categories", `{"name":"上衣","parent_id":null}`)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestCreateCategoryRejectsEmptyParentID(t *testing.T) {
	server := newAPITestServer(t)

	rr := performJSONRequest(server.router, http.MethodPost, "/api/product-categories", `{"name":"上衣","parent_id":""}`)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestDeleteCategoryInvalidID(t *testing.T) {
	server := newAPITestServer(t)

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodDelete, "/api/product-categories/not-a-uuid", nil)
	server.router.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestUpdateCategory(t *testing.T) {
	server := newAPITestServer(t)
	now := time.Now()
	expectCategoryByID(server.mock, testCategoryID)
	server.mock.ExpectQuery(`UPDATE product_categories\s+SET name = \$1, parent_id = \$2, "order" = \$3, active = \$4\s+WHERE id = \$5\s+RETURNING updated_at`).
		WithArgs("上衣", nil, 3, true, testCategoryID).
		WillReturnRows(sqlmock.NewRows([]string{"updated_at"}).AddRow(now))

	rr := performJSONRequest(server.router, http.MethodPatch, "/api/product-categories/"+testCategoryID, `{"order":3}`)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestUpdateCategoryRejectsEmptyBody(t *testing.T) {
	server := newAPITestServer(t)

	rr := performJSONRequest(server.router, http.MethodPatch, "/api/product-categories/"+testCategoryID, `{}`)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestUpdateCategoryNotFound(t *testing.T) {
	server := newAPITestServer(t)
	server.mock.ExpectQuery(`SELECT id, name, parent_id, "order", active, created_at, updated_at\s+FROM product_categories WHERE id = \$1`).
		WithArgs(testCategoryID).
		WillReturnError(sql.ErrNoRows)

	rr := performJSONRequest(server.router, http.MethodPatch, "/api/product-categories/"+testCategoryID, `{"order":3}`)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestReorderCategories(t *testing.T) {
	server := newAPITestServer(t)
	idA := "8594e2e0-4b1e-4224-8f1e-2310419cf661"
	idB := "b1d2c3e4-5f60-4718-8293-a0b1c2d3e4f5"
	server.mock.ExpectBegin()
	server.mock.ExpectQuery(`SELECT id FROM product_categories WHERE parent_id IS NULL`).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(idA).AddRow(idB))
	server.mock.ExpectExec(`UPDATE product_categories SET "order" = \$1 WHERE id = \$2`).
		WithArgs(1, idB).
		WillReturnResult(sqlmock.NewResult(0, 1))
	server.mock.ExpectExec(`UPDATE product_categories SET "order" = \$1 WHERE id = \$2`).
		WithArgs(2, idA).
		WillReturnResult(sqlmock.NewResult(0, 1))
	server.mock.ExpectCommit()

	rr := performJSONRequest(server.router, http.MethodPatch, "/api/product-categories/reorder",
		`{"parent_id":null,"ordered_ids":["`+idB+`","`+idA+`"]}`)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestReorderCategoriesRejectsMemberMismatch(t *testing.T) {
	server := newAPITestServer(t)
	idA := "8594e2e0-4b1e-4224-8f1e-2310419cf661"
	idB := "b1d2c3e4-5f60-4718-8293-a0b1c2d3e4f5"
	server.mock.ExpectBegin()
	server.mock.ExpectQuery(`SELECT id FROM product_categories WHERE parent_id IS NULL`).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(idA))
	server.mock.ExpectRollback()

	rr := performJSONRequest(server.router, http.MethodPatch, "/api/product-categories/reorder",
		`{"parent_id":null,"ordered_ids":["`+idA+`","`+idB+`"]}`)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
	if !strings.Contains(rr.Body.String(), "ordered_ids") {
		t.Fatalf("expected field error for ordered_ids, got %s", rr.Body.String())
	}
}

func TestUpload(t *testing.T) {
	server := newAPITestServer(t)
	now := time.Now()
	body, contentType := multipartImageBody(t)

	server.mock.ExpectBegin()
	server.mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO assets (name, mime, size, width, height, url, thumb_url)
		          VALUES ($1, $2, $3, $4, $5, $6, $7)
		          RETURNING id, created_at`)).
		WithArgs("product.jpg", "image/jpeg", sqlmock.AnyArg(), 2, 2, sqlmock.AnyArg(), nil).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at"}).AddRow(testAssetID, now))
	server.mock.ExpectCommit()

	req := httptest.NewRequest(http.MethodPost, "/api/upload", body)
	req.Header.Set("Content-Type", contentType)
	rr := httptest.NewRecorder()
	server.router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
	if !strings.Contains(rr.Body.String(), "/assets/") {
		t.Fatalf("expected asset URL to include /assets/, got %s", rr.Body.String())
	}
}

func TestCreateProductWithoutImages(t *testing.T) {
	server := newAPITestServer(t)
	now := time.Now()
	expectCategoryByID(server.mock, testCategoryID)
	server.mock.ExpectBegin()
	server.mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO products (name, category_id, price, quantity, sale_status, has_variants)
		                 VALUES ($1, $2, $3, $4, $5, $6)
		                 RETURNING id, created_at, updated_at`)).
		WithArgs("經典白色T恤", testCategoryID, int64(590), 0, "active", false).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).AddRow(testProductID, now, now))
	server.mock.ExpectCommit()

	payload := `{"category_id":"` + testCategoryID + `","image_ids":[],"name":"經典白色T恤","price":"590","quantity":0,"option_groups":[],"variants":[]}`
	rr := performJSONRequest(server.router, http.MethodPost, "/api/products", payload)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestCreateProductRejectsEmptyImageID(t *testing.T) {
	server := newAPITestServer(t)

	payload := `{"category_id":"` + testCategoryID + `","image_ids":[""],"name":"經典白色T恤","price":"590","quantity":0}`
	rr := performJSONRequest(server.router, http.MethodPost, "/api/products", payload)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
	if !strings.Contains(rr.Body.String(), "image_ids[0]") {
		t.Fatalf("expected field error for image_ids[0], got %s", rr.Body.String())
	}
}

func TestCreateProductWithImage(t *testing.T) {
	server := newAPITestServer(t)
	now := time.Now()
	expectCategoryByID(server.mock, testCategoryID)
	server.mock.ExpectQuery(regexp.QuoteMeta(`SELECT id, name, mime, size, width, height, url, thumb_url, created_at
	          FROM assets WHERE id = ANY($1)`)).
		WithArgs(sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "mime", "size", "width", "height", "url", "thumb_url", "created_at"}).
			AddRow(testAssetID, "product.jpg", "image/jpeg", int64(100), 2, 2, "http://localhost:8002/assets/product.jpg", nil, now))
	server.mock.ExpectBegin()
	server.mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO products (name, category_id, price, quantity, sale_status, has_variants)
		                 VALUES ($1, $2, $3, $4, $5, $6)
		                 RETURNING id, created_at, updated_at`)).
		WithArgs("經典白色T恤", testCategoryID, int64(590), 0, "active", false).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).AddRow(testProductID, now, now))
	server.mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO product_images (product_id, asset_id, display_order)
			               VALUES ($1, $2, $3)`)).
		WithArgs(testProductID, testAssetID, 0).
		WillReturnResult(sqlmock.NewResult(0, 1))
	server.mock.ExpectCommit()

	payload := `{"category_id":"` + testCategoryID + `","image_ids":["` + testAssetID + `"],"name":"經典白色T恤","price":"590","quantity":0}`
	rr := performJSONRequest(server.router, http.MethodPost, "/api/products", payload)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestGetProductNotFound(t *testing.T) {
	server := newAPITestServer(t)
	expectProductNotFound(server.mock, testProductID)

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/products/"+testProductID, nil)
	server.router.ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestGetProduct(t *testing.T) {
	server := newAPITestServer(t)
	expectProductByID(server.mock, testProductID)

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/products/"+testProductID, nil)
	server.router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
	if !strings.Contains(rr.Body.String(), `"stock_status":"in-stock"`) {
		t.Fatalf("expected in-stock status, got %s", rr.Body.String())
	}
}

func TestListProducts(t *testing.T) {
	server := newAPITestServer(t)
	server.mock.ExpectQuery(`SELECT COUNT`).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))
	server.mock.ExpectQuery(`SELECT p.id`).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "category_id", "price", "quantity", "sale_status", "has_variants", "created_at", "updated_at"}))

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/products", nil)
	server.router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestListProductsIncludesOutOfStockStatus(t *testing.T) {
	server := newAPITestServer(t)
	now := time.Now()
	server.mock.ExpectQuery(`SELECT COUNT`).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))
	server.mock.ExpectQuery(`SELECT p.id`).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "category_id", "price", "quantity", "sale_status", "has_variants", "created_at", "updated_at"}).
			AddRow(testProductID, "經典白色T恤", testCategoryID, int64(590), 0, "active", false, now, now))
	expectProductByIDWithStock(server.mock, testProductID, 0)

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/products", nil)
	server.router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
	if !strings.Contains(rr.Body.String(), `"stock_status":"out-of-stock"`) {
		t.Fatalf("expected out-of-stock status, got %s", rr.Body.String())
	}
}

func TestUpdateProduct(t *testing.T) {
	server := newAPITestServer(t)
	now := time.Now()
	expectProductByID(server.mock, testProductID)
	server.mock.ExpectBegin()
	server.mock.ExpectQuery(regexp.QuoteMeta(`UPDATE products
		                SET name = $1, category_id = $2, price = $3, quantity = $4, sale_status = $5, has_variants = $6
		                WHERE id = $7
		                RETURNING updated_at`)).
		WithArgs("更新T恤", testCategoryID, int64(690), 10, "active", false, testProductID).
		WillReturnRows(sqlmock.NewRows([]string{"updated_at"}).AddRow(now))
	server.mock.ExpectCommit()

	payload := `{"name":"更新T恤","price":"690"}`
	rr := performJSONRequest(server.router, http.MethodPatch, "/api/products/"+testProductID, payload)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestDeleteProduct(t *testing.T) {
	server := newAPITestServer(t)
	expectProductByID(server.mock, testProductID)
	server.mock.ExpectBegin()
	server.mock.ExpectQuery(`SELECT EXISTS\(`).
		WithArgs(testProductID).
		WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(false))
	server.mock.ExpectExec(`DELETE FROM products WHERE id = \$1`).
		WithArgs(testProductID).
		WillReturnResult(sqlmock.NewResult(0, 1))
	server.mock.ExpectCommit()

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodDelete, "/api/products/"+testProductID, nil)
	server.router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestBatchDeleteProductsValidation(t *testing.T) {
	server := newAPITestServer(t)

	rr := performJSONRequest(server.router, http.MethodPost, "/api/products/batch-delete", `{"ids":[""]}`)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestGetProductOptions(t *testing.T) {
	server := newAPITestServer(t)
	server.mock.ExpectQuery(`SELECT DISTINCT name\s+FROM product_option_groups\s+WHERE deleted_at IS NULL\s+ORDER BY name ASC`).
		WillReturnRows(sqlmock.NewRows([]string{"name"}).AddRow("尺寸"))
	server.mock.ExpectQuery(`SELECT DISTINCT pov.value`).
		WithArgs("尺寸").
		WillReturnRows(sqlmock.NewRows([]string{"value"}).AddRow("S號").AddRow("M號"))

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/product-options", nil)
	server.router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestCreateProductWithVariantQuantityZeroCanOrder(t *testing.T) {
	server := newAPITestServer(t)
	now := time.Now()
	expectCategoryByID(server.mock, testCategoryID)
	server.mock.ExpectBegin()
	server.mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO products (name, category_id, price, quantity, sale_status, has_variants)
		                 VALUES ($1, $2, $3, $4, $5, $6)
		                 RETURNING id, created_at, updated_at`)).
		WithArgs("經典白色T恤", testCategoryID, int64(590), 0, "active", true).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).AddRow(testProductID, now, now))
	server.mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO product_option_groups (product_id, name, position)
		               VALUES ($1, $2, $3)
		               RETURNING id, created_at, updated_at`)).
		WithArgs(testProductID, "尺寸", 0).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).AddRow("11111111-1111-4111-8111-111111111111", now, now))
	server.mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO product_option_values (option_group_id, value, position)
			               VALUES ($1, $2, $3)
			               RETURNING id, created_at, updated_at`)).
		WithArgs("11111111-1111-4111-8111-111111111111", "S", 0).
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).AddRow("22222222-2222-4222-8222-222222222222", now, now))
	server.mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO product_variants (product_id, option_values, quantity, sale_status)
	                 VALUES ($1, $2, $3, $4)
	                 RETURNING id, created_at, updated_at`)).
		WithArgs(testProductID, []byte(`{"尺寸":"S"}`), 0, "active").
		WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).AddRow(testVariantID, now, now))
	server.mock.ExpectCommit()

	payload := `{"category_id":"` + testCategoryID + `","name":"經典白色T恤","price":"590","option_groups":[{"name":"尺寸","values":["S"]}],"variants":[{"option_values":{"尺寸":"S"},"quantity":0,"sale_status":"active"}]}`
	rr := performJSONRequest(server.router, http.MethodPost, "/api/products", payload)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestCreateOrderRequiresVariantForVariantProduct(t *testing.T) {
	server := newAPITestServer(t)
	expectProductByIDWithVariant(server.mock, testProductID, 0, "active", "active")

	payload := `{"items":[{"product_id":"` + testProductID + `","quantity":1}]}`
	rr := performJSONRequest(server.router, http.MethodPost, "/api/orders", payload)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
	if !strings.Contains(rr.Body.String(), "商品有變體時必須指定 product_variant_id") {
		t.Fatalf("expected variant required message, got %s", rr.Body.String())
	}
}

func TestCreateOrderRejectsVariantForNonVariantProduct(t *testing.T) {
	server := newAPITestServer(t)
	expectProductByIDWithStock(server.mock, testProductID, 0)

	payload := `{"items":[{"product_id":"` + testProductID + `","product_variant_id":"` + testVariantID + `","quantity":1}]}`
	rr := performJSONRequest(server.router, http.MethodPost, "/api/orders", payload)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
	if !strings.Contains(rr.Body.String(), "商品無變體時不可指定 product_variant_id") {
		t.Fatalf("expected variant forbidden message, got %s", rr.Body.String())
	}
}

func TestCreateOrderRejectsInactiveProduct(t *testing.T) {
	server := newAPITestServer(t)
	expectProductByIDWithVariant(server.mock, testProductID, 0, "inactive", "active")

	payload := `{"items":[{"product_id":"` + testProductID + `","product_variant_id":"` + testVariantID + `","quantity":1}]}`
	rr := performJSONRequest(server.router, http.MethodPost, "/api/orders", payload)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
	if !strings.Contains(rr.Body.String(), "商品已下架") {
		t.Fatalf("expected inactive product message, got %s", rr.Body.String())
	}
}

func TestCreateOrderRejectsInactiveVariant(t *testing.T) {
	server := newAPITestServer(t)
	expectProductByIDWithVariant(server.mock, testProductID, 0, "active", "inactive")

	payload := `{"items":[{"product_id":"` + testProductID + `","product_variant_id":"` + testVariantID + `","quantity":1}]}`
	rr := performJSONRequest(server.router, http.MethodPost, "/api/orders", payload)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
	if !strings.Contains(rr.Body.String(), "商品變體已下架") {
		t.Fatalf("expected inactive variant message, got %s", rr.Body.String())
	}
}

func multipartImageBody(t *testing.T) (*bytes.Buffer, string) {
	t.Helper()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("files", "product.jpg")
	if err != nil {
		t.Fatalf("create form file: %v", err)
	}

	img := image.NewRGBA(image.Rect(0, 0, 2, 2))
	img.Set(0, 0, color.White)
	if err := jpeg.Encode(part, img, nil); err != nil {
		t.Fatalf("encode jpeg: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("close multipart writer: %v", err)
	}

	return body, writer.FormDataContentType()
}
