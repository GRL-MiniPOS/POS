package repository

import (
	"context"
	"database/sql"
	"fmt"
	"github/pos/internal/model"
	possql "github/pos/internal/storage/sql"

	"github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type CategoryRepository struct {
	db *sqlx.DB
}

func NewCategoryRepository(db *sqlx.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// GetAll retrieves all product categories with optional filtering
func (r *CategoryRepository) GetAll(ctx context.Context, activeOnly bool, parentID *string) ([]model.ProductCategory, error) {
	psql := squirrel.StatementBuilder.PlaceholderFormat(squirrel.Dollar)
	queryBuilder := psql.Select("id", "name", "parent_id", "\"order\"", "active", "created_at", "updated_at").
		From("product_categories")

	if activeOnly {
		queryBuilder = queryBuilder.Where(squirrel.Eq{"active": true})
	}

	if parentID != nil {
		if *parentID == "" {
			queryBuilder = queryBuilder.Where(squirrel.Eq{"parent_id": nil})
		} else {
			queryBuilder = queryBuilder.Where(squirrel.Eq{"parent_id": *parentID})
		}
	}

	query, args, err := queryBuilder.OrderBy("\"order\" ASC", "created_at ASC").ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build query: %w", err)
	}

	var categories []model.ProductCategory
	err = r.db.SelectContext(ctx, &categories, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}

	return categories, nil
}

// GetByID retrieves a single category by ID
func (r *CategoryRepository) GetByID(ctx context.Context, id string) (*model.ProductCategory, error) {
	var category model.ProductCategory
	query := `SELECT id, name, parent_id, "order", active, created_at, updated_at
	          FROM product_categories WHERE id = $1`

	err := r.db.GetContext(ctx, &category, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	return &category, nil
}

// GetByName retrieves a category by name
func (r *CategoryRepository) GetByName(ctx context.Context, name string) (*model.ProductCategory, error) {
	var category model.ProductCategory
	query := `SELECT id, name, parent_id, "order", active, created_at, updated_at
	          FROM product_categories WHERE name = $1`

	err := r.db.GetContext(ctx, &category, query, name)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get category by name: %w", err)
	}

	return &category, nil
}

// Create creates a new product category
func (r *CategoryRepository) Create(ctx context.Context, category *model.ProductCategory) error {
	query := `INSERT INTO product_categories (name, parent_id, "order", active)
	          VALUES ($1, $2, $3, $4)
	          RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query, category.Name, category.ParentID, category.Order, category.Active).
		Scan(&category.ID, &category.CreatedAt, &category.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}

	return nil
}

// GetNextOrder returns the next display order within the same category level.
func (r *CategoryRepository) GetNextOrder(ctx context.Context, parentID *string) (int, error) {
	var maxOrder sql.NullInt64
	var err error
	if parentID == nil {
		err = r.db.GetContext(ctx, &maxOrder, `SELECT MAX("order") FROM product_categories WHERE parent_id IS NULL`)
	} else {
		err = r.db.GetContext(ctx, &maxOrder, `SELECT MAX("order") FROM product_categories WHERE parent_id = $1`, *parentID)
	}
	if err != nil {
		return 0, fmt.Errorf("failed to get next category order: %w", err)
	}
	if !maxOrder.Valid {
		return 1, nil
	}
	return int(maxOrder.Int64) + 1, nil
}

// Update updates an existing category
func (r *CategoryRepository) Update(ctx context.Context, category *model.ProductCategory) error {
	query := `UPDATE product_categories
	          SET name = $1, parent_id = $2, "order" = $3, active = $4
	          WHERE id = $5
	          RETURNING updated_at`

	err := r.db.QueryRowContext(ctx, query, category.Name, category.ParentID, category.Order, category.Active, category.ID).
		Scan(&category.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update category: %w", err)
	}

	return nil
}

// Delete deletes a category and its subcategories, sets products to NULL
func (r *CategoryRepository) Delete(ctx context.Context, id string) error {
	return possql.RunInTx(ctx, r.db, func(tx *sqlx.Tx) error {
		// Get all subcategory IDs (including nested ones)
		subcategoryIDs, err := r.getAllSubcategoryIDs(ctx, tx, id)
		if err != nil {
			return err
		}

		allIDs := append([]string{id}, subcategoryIDs...)

		// Set products' category_id to NULL for all affected categories
		query := `UPDATE products SET category_id = NULL WHERE category_id = ANY($1)`
		_, err = tx.ExecContext(ctx, query, pq.Array(allIDs))
		if err != nil {
			return fmt.Errorf("failed to update products: %w", err)
		}

		// Delete the category (CASCADE will delete subcategories)
		deleteQuery := `DELETE FROM product_categories WHERE id = $1`
		result, err := tx.ExecContext(ctx, deleteQuery, id)
		if err != nil {
			return fmt.Errorf("failed to delete category: %w", err)
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			return fmt.Errorf("failed to get rows affected: %w", err)
		}

		if rowsAffected == 0 {
			return fmt.Errorf("category not found")
		}

		return nil
	})
}

// getAllSubcategoryIDs recursively gets all subcategory IDs
func (r *CategoryRepository) getAllSubcategoryIDs(ctx context.Context, tx *sqlx.Tx, parentID string) ([]string, error) {
	query := `WITH RECURSIVE subcategories AS (
		SELECT id FROM product_categories WHERE parent_id = $1
		UNION ALL
		SELECT pc.id FROM product_categories pc
		INNER JOIN subcategories sc ON pc.parent_id = sc.id
	)
	SELECT id FROM subcategories`

	var ids []string
	err := tx.SelectContext(ctx, &ids, query, parentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get subcategory IDs: %w", err)
	}

	return ids, nil
}

// HasProducts checks if a category has products with stock
func (r *CategoryRepository) HasProducts(ctx context.Context, categoryID string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM products p
			WHERE p.category_id = $1
			AND (
				(p.has_variants = false AND p.quantity > 0)
				OR EXISTS (
					SELECT 1 FROM product_variants pv
					WHERE pv.product_id = p.id
					AND pv.deleted_at IS NULL
					AND pv.quantity > 0
				)
			)
		)`

	var exists bool
	err := r.db.GetContext(ctx, &exists, query, categoryID)
	if err != nil {
		return false, fmt.Errorf("failed to check products: %w", err)
	}

	return exists, nil
}
