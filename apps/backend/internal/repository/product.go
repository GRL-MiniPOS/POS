package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"github/pos/internal/model"
	possql "github/pos/internal/storage/sql"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"
)

type ProductRepository struct {
	db *sqlx.DB
}

func NewProductRepository(db *sqlx.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

type ProductFilter struct {
	Search      string
	Categories  []string
	Options     []string
	PriceMin    *int64
	PriceMax    *int64
	StockStatus string
	SaleStatus  string
	Page        int
	Limit       int
}

func (r *ProductRepository) Create(ctx context.Context, product *model.Product, groups []model.ProductOptionGroupWithValues, variants []model.ProductVariant, imageIDs []string) error {
	return possql.RunInTx(ctx, r.db, func(tx *sqlx.Tx) error {
		productQuery := `INSERT INTO products (name, category_id, price, quantity, sale_status, has_variants)
		                 VALUES ($1, $2, $3, $4, $5, $6)
		                 RETURNING id, created_at, updated_at`

		err := tx.QueryRowContext(ctx, productQuery, product.Name, product.CategoryID, product.Price, product.Quantity, product.SaleStatus, product.HasVariants).
			Scan(&product.ID, &product.CreatedAt, &product.UpdatedAt)
		if err != nil {
			return fmt.Errorf("failed to create product: %w", err)
		}

		if err := r.replaceOptionsAndVariants(ctx, tx, product.ID, groups, variants); err != nil {
			return err
		}

		if err := r.replaceImages(ctx, tx, product.ID, imageIDs); err != nil {
			return err
		}

		return nil
	})
}

func (r *ProductRepository) GetByID(ctx context.Context, id string) (*model.ProductWithDetails, error) {
	var product model.Product
	query := `SELECT id, name, category_id, price, quantity, sale_status, has_variants, created_at, updated_at
	          FROM products WHERE id = $1`

	err := r.db.GetContext(ctx, &product, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get product: %w", err)
	}

	result := &model.ProductWithDetails{Product: product}

	if product.CategoryID != nil {
		var category model.ProductCategory
		categoryQuery := `SELECT id, name, parent_id, "order", active, created_at, updated_at
		                  FROM product_categories WHERE id = $1`
		err = r.db.GetContext(ctx, &category, categoryQuery, *product.CategoryID)
		if err == nil {
			result.Category = &category
		}
	}

	groups, err := r.getOptionGroups(ctx, id)
	if err != nil {
		return nil, err
	}
	result.OptionGroups = groups

	variants, err := r.getVariants(ctx, id)
	if err != nil {
		return nil, err
	}
	result.Variants = variants

	if product.HasVariants {
		for _, variant := range result.Variants {
			result.Stock += variant.Quantity
		}
	} else {
		result.Stock = product.Quantity
	}

	imagesQuery := `SELECT a.id, a.name, a.mime, a.size, a.width, a.height, a.url, a.thumb_url, a.created_at, pi.display_order
	                FROM assets a
	                INNER JOIN product_images pi ON a.id = pi.asset_id
	                WHERE pi.product_id = $1
	                ORDER BY pi.display_order ASC`

	rows, err := r.db.QueryContext(ctx, imagesQuery, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get images: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var asset model.AssetWithOrder
		err := rows.Scan(
			&asset.ID,
			&asset.Name,
			&asset.Mime,
			&asset.Size,
			&asset.Width,
			&asset.Height,
			&asset.URL,
			&asset.ThumbURL,
			&asset.CreatedAt,
			&asset.DisplayOrder,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan image: %w", err)
		}
		result.Images = append(result.Images, asset)
	}

	return result, nil
}

func (r *ProductRepository) List(ctx context.Context, filter ProductFilter) ([]model.ProductWithDetails, int, error) {
	psql := squirrel.StatementBuilder.PlaceholderFormat(squirrel.Dollar)
	baseWhere := squirrel.And{squirrel.Eq{"1": 1}}

	if filter.Search != "" {
		baseWhere = append(baseWhere, squirrel.ILike{"p.name": "%" + filter.Search + "%"})
	}
	if len(filter.Categories) > 0 {
		baseWhere = append(baseWhere, squirrel.Eq{"p.category_id": filter.Categories})
	}
	if len(filter.Options) > 0 {
		for _, option := range filter.Options {
			subQuery := squirrel.Select("1").
				From("product_variants pv").
				Where(squirrel.And{
					squirrel.Expr("pv.product_id = p.id"),
					squirrel.Expr("pv.option_values::text ILIKE ?", "%"+option+"%"),
					squirrel.Eq{"pv.deleted_at": nil},
				})
			baseWhere = append(baseWhere, squirrel.Expr("EXISTS ?", subQuery))
		}
	}
	if filter.PriceMin != nil {
		baseWhere = append(baseWhere, squirrel.GtOrEq{"p.price": *filter.PriceMin})
	}
	if filter.PriceMax != nil {
		baseWhere = append(baseWhere, squirrel.LtOrEq{"p.price": *filter.PriceMax})
	}
	if filter.SaleStatus != "" && filter.SaleStatus != "all" {
		baseWhere = append(baseWhere, squirrel.Eq{"p.sale_status": filter.SaleStatus})
	}
	if filter.StockStatus == "in-stock" {
		baseWhere = append(baseWhere, squirrel.Or{
			squirrel.And{squirrel.Eq{"p.has_variants": false}, squirrel.Gt{"p.quantity": 0}},
			squirrel.Expr(`EXISTS (
				SELECT 1 FROM product_variants pv
				WHERE pv.product_id = p.id AND pv.deleted_at IS NULL AND pv.quantity > 0
			)`),
		})
	} else if filter.StockStatus == "out-of-stock" {
		baseWhere = append(baseWhere, squirrel.And{
			squirrel.Or{
				squirrel.And{squirrel.Eq{"p.has_variants": false}, squirrel.Eq{"p.quantity": 0}},
				squirrel.And{
					squirrel.Eq{"p.has_variants": true},
					squirrel.Expr(`NOT EXISTS (
						SELECT 1 FROM product_variants pv
						WHERE pv.product_id = p.id AND pv.deleted_at IS NULL AND pv.quantity > 0
					)`),
				},
			},
		})
	}

	countQuery, countArgs, err := psql.Select("COUNT(*)").From("products p").Where(baseWhere).ToSql()
	if err != nil {
		return nil, 0, fmt.Errorf("failed to build count query: %w", err)
	}

	var total int
	err = r.db.GetContext(ctx, &total, countQuery, countArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count products: %w", err)
	}

	offset := uint64((filter.Page - 1) * filter.Limit)
	query, args, err := psql.Select("p.id", "p.name", "p.category_id", "p.price", "p.quantity", "p.sale_status", "p.has_variants", "p.created_at", "p.updated_at").
		From("products p").
		Where(baseWhere).
		OrderBy("p.created_at DESC").
		Limit(uint64(filter.Limit)).
		Offset(offset).
		ToSql()
	if err != nil {
		return nil, 0, fmt.Errorf("failed to build list query: %w", err)
	}

	var products []model.Product
	err = r.db.SelectContext(ctx, &products, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get products: %w", err)
	}

	result := make([]model.ProductWithDetails, 0, len(products))
	for _, product := range products {
		details, err := r.GetByID(ctx, product.ID)
		if err != nil {
			return nil, 0, err
		}
		if details != nil {
			result = append(result, *details)
		}
	}

	return result, total, nil
}

func (r *ProductRepository) Update(ctx context.Context, product *model.Product, groups *[]model.ProductOptionGroupWithValues, variants *[]model.ProductVariant, imageIDs *[]string) error {
	return possql.RunInTx(ctx, r.db, func(tx *sqlx.Tx) error {
		updateQuery := `UPDATE products
		                SET name = $1, category_id = $2, price = $3, quantity = $4, sale_status = $5, has_variants = $6
		                WHERE id = $7
		                RETURNING updated_at`

		err := tx.QueryRowContext(ctx, updateQuery, product.Name, product.CategoryID, product.Price, product.Quantity, product.SaleStatus, product.HasVariants, product.ID).
			Scan(&product.UpdatedAt)
		if err != nil {
			return fmt.Errorf("failed to update product: %w", err)
		}

		if groups != nil && variants != nil {
			now := time.Now()
			if _, err = tx.ExecContext(ctx, `UPDATE product_option_values pov
				SET deleted_at = $1
				FROM product_option_groups pog
				WHERE pov.option_group_id = pog.id AND pog.product_id = $2 AND pov.deleted_at IS NULL`, now, product.ID); err != nil {
				return fmt.Errorf("failed to reset option values: %w", err)
			}
			if _, err = tx.ExecContext(ctx, `UPDATE product_option_groups SET deleted_at = $1 WHERE product_id = $2 AND deleted_at IS NULL`, now, product.ID); err != nil {
				return fmt.Errorf("failed to reset option groups: %w", err)
			}
			if _, err = tx.ExecContext(ctx, `UPDATE product_variants SET deleted_at = $1 WHERE product_id = $2 AND deleted_at IS NULL`, now, product.ID); err != nil {
				return fmt.Errorf("failed to reset variants: %w", err)
			}
			if err := r.replaceOptionsAndVariants(ctx, tx, product.ID, *groups, *variants); err != nil {
				return err
			}
		}

		if imageIDs != nil {
			if _, err = tx.ExecContext(ctx, `DELETE FROM product_images WHERE product_id = $1`, product.ID); err != nil {
				return fmt.Errorf("failed to delete existing images: %w", err)
			}
			if err := r.replaceImages(ctx, tx, product.ID, *imageIDs); err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *ProductRepository) Delete(ctx context.Context, id string) error {
	return possql.RunInTx(ctx, r.db, func(tx *sqlx.Tx) error {
		hasPendingOrders, err := r.HasPendingOrders(ctx, id)
		if err != nil {
			return err
		}
		if hasPendingOrders {
			return fmt.Errorf("product has pending orders")
		}

		result, err := tx.ExecContext(ctx, `DELETE FROM products WHERE id = $1`, id)
		if err != nil {
			return fmt.Errorf("failed to delete product: %w", err)
		}
		rowsAffected, err := result.RowsAffected()
		if err != nil {
			return fmt.Errorf("failed to get rows affected: %w", err)
		}
		if rowsAffected == 0 {
			return fmt.Errorf("product not found")
		}
		return nil
	})
}

func (r *ProductRepository) BatchDelete(ctx context.Context, ids []string) (int, []string, error) {
	failedIDs := []string{}
	deletedCount := 0
	for _, id := range ids {
		err := r.Delete(ctx, id)
		if err != nil {
			failedIDs = append(failedIDs, id)
		} else {
			deletedCount++
		}
	}
	return deletedCount, failedIDs, nil
}

func (r *ProductRepository) HasPendingOrders(ctx context.Context, productID string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM order_items oi
			INNER JOIN orders o ON oi.order_id = o.id
			WHERE oi.product_id = $1
			AND o.status IN ('pending', 'processing', 'shipped')
		)`

	var exists bool
	err := r.db.GetContext(ctx, &exists, query, productID)
	if err != nil {
		return false, fmt.Errorf("failed to check pending orders: %w", err)
	}
	return exists, nil
}

func (r *ProductRepository) GetAllOptions(ctx context.Context) ([]model.ProductOptionGroupWithValues, error) {
	query := `SELECT DISTINCT name
	          FROM product_option_groups
	          WHERE deleted_at IS NULL
	          ORDER BY name ASC`

	var names []string
	if err := r.db.SelectContext(ctx, &names, query); err != nil {
		return nil, fmt.Errorf("failed to get option groups: %w", err)
	}

	result := make([]model.ProductOptionGroupWithValues, 0, len(names))
	for i, name := range names {
		group := model.ProductOptionGroupWithValues{
			ProductOptionGroup: model.ProductOptionGroup{Name: name, Position: i},
		}
		valuesQuery := `SELECT DISTINCT pov.value
			FROM product_option_values pov
			INNER JOIN product_option_groups pog ON pov.option_group_id = pog.id
			WHERE pog.name = $1 AND pog.deleted_at IS NULL AND pov.deleted_at IS NULL
			ORDER BY pov.value ASC`
		var values []string
		if err := r.db.SelectContext(ctx, &values, valuesQuery, name); err != nil {
			return nil, fmt.Errorf("failed to get option values: %w", err)
		}
		for j, value := range values {
			group.Values = append(group.Values, model.ProductOptionValue{Value: value, Position: j})
		}
		result = append(result, group)
	}
	return result, nil
}

func (r *ProductRepository) ValidateOrderItem(ctx context.Context, productID string, productVariantID *string) error {
	product, err := r.GetByID(ctx, productID)
	if err != nil {
		return err
	}
	if product == nil {
		return fmt.Errorf("product not found")
	}
	if product.SaleStatus != model.SaleStatusActive {
		return fmt.Errorf("product inactive")
	}
	if product.HasVariants {
		if productVariantID == nil || *productVariantID == "" {
			return fmt.Errorf("variant required")
		}
		for _, variant := range product.Variants {
			if variant.ID == *productVariantID {
				if variant.SaleStatus != model.SaleStatusActive {
					return fmt.Errorf("variant inactive")
				}
				return nil
			}
		}
		return fmt.Errorf("variant does not belong to product")
	}
	if productVariantID != nil && *productVariantID != "" {
		return fmt.Errorf("variant not allowed")
	}
	return nil
}

func (r *ProductRepository) replaceOptionsAndVariants(ctx context.Context, tx *sqlx.Tx, productID string, groups []model.ProductOptionGroupWithValues, variants []model.ProductVariant) error {
	groupIDByName := map[string]string{}
	for i := range groups {
		groupQuery := `INSERT INTO product_option_groups (product_id, name, position)
		               VALUES ($1, $2, $3)
		               RETURNING id, created_at, updated_at`
		if err := tx.QueryRowContext(ctx, groupQuery, productID, groups[i].Name, groups[i].Position).
			Scan(&groups[i].ID, &groups[i].CreatedAt, &groups[i].UpdatedAt); err != nil {
			return fmt.Errorf("failed to create option group: %w", err)
		}
		groups[i].ProductID = productID
		groupIDByName[groups[i].Name] = groups[i].ID

		for j := range groups[i].Values {
			valueQuery := `INSERT INTO product_option_values (option_group_id, value, position)
			               VALUES ($1, $2, $3)
			               RETURNING id, created_at, updated_at`
			if err := tx.QueryRowContext(ctx, valueQuery, groups[i].ID, groups[i].Values[j].Value, groups[i].Values[j].Position).
				Scan(&groups[i].Values[j].ID, &groups[i].Values[j].CreatedAt, &groups[i].Values[j].UpdatedAt); err != nil {
				return fmt.Errorf("failed to create option value: %w", err)
			}
			groups[i].Values[j].OptionGroupID = groups[i].ID
		}
	}

	variantQuery := `INSERT INTO product_variants (product_id, option_values, quantity, sale_status)
	                 VALUES ($1, $2, $3, $4)
	                 RETURNING id, created_at, updated_at`
	for i := range variants {
		for name := range variants[i].OptionValues {
			if _, ok := groupIDByName[name]; !ok {
				return fmt.Errorf("variant references unknown option group %q", name)
			}
		}
		if err := variants[i].EncodeOptionValues(); err != nil {
			return fmt.Errorf("failed to encode variant option values: %w", err)
		}
		if err := tx.QueryRowContext(ctx, variantQuery, productID, variants[i].OptionValuesJSON, variants[i].Quantity, variants[i].SaleStatus).
			Scan(&variants[i].ID, &variants[i].CreatedAt, &variants[i].UpdatedAt); err != nil {
			return fmt.Errorf("failed to create variant: %w", err)
		}
		variants[i].ProductID = productID
	}
	return nil
}

func (r *ProductRepository) replaceImages(ctx context.Context, tx *sqlx.Tx, productID string, imageIDs []string) error {
	if len(imageIDs) == 0 {
		return nil
	}
	imageQuery := `INSERT INTO product_images (product_id, asset_id, display_order)
	               VALUES ($1, $2, $3)`
	for i, imageID := range imageIDs {
		if _, err := tx.ExecContext(ctx, imageQuery, productID, imageID, i); err != nil {
			return fmt.Errorf("failed to create product image: %w", err)
		}
	}
	return nil
}

func (r *ProductRepository) getOptionGroups(ctx context.Context, productID string) ([]model.ProductOptionGroupWithValues, error) {
	groupsQuery := `SELECT id, product_id, name, position, created_at, updated_at, deleted_at
	               FROM product_option_groups
	               WHERE product_id = $1 AND deleted_at IS NULL
	               ORDER BY position ASC, created_at ASC`
	var groups []model.ProductOptionGroupWithValues
	if err := r.db.SelectContext(ctx, &groups, groupsQuery, productID); err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to get option groups: %w", err)
	}

	for i := range groups {
		valuesQuery := `SELECT id, option_group_id, value, position, created_at, updated_at, deleted_at
		                FROM product_option_values
		                WHERE option_group_id = $1 AND deleted_at IS NULL
		                ORDER BY position ASC, created_at ASC`
		if err := r.db.SelectContext(ctx, &groups[i].Values, valuesQuery, groups[i].ID); err != nil && err != sql.ErrNoRows {
			return nil, fmt.Errorf("failed to get option values: %w", err)
		}
	}
	return groups, nil
}

func (r *ProductRepository) getVariants(ctx context.Context, productID string) ([]model.ProductVariant, error) {
	variantsQuery := `SELECT id, product_id, option_values, quantity, sale_status, created_at, updated_at, deleted_at
	                 FROM product_variants
	                 WHERE product_id = $1 AND deleted_at IS NULL
	                 ORDER BY created_at ASC`
	var variants []model.ProductVariant
	if err := r.db.SelectContext(ctx, &variants, variantsQuery, productID); err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to get variants: %w", err)
	}
	for i := range variants {
		if err := variants[i].DecodeOptionValues(); err != nil {
			return nil, fmt.Errorf("failed to decode variant option values: %w", err)
		}
	}
	return variants, nil
}

func VariantKey(values map[string]string) (string, error) {
	data, err := json.Marshal(values)
	if err != nil {
		return "", err
	}
	return string(data), nil
}
