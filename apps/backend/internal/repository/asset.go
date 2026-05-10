package repository

import (
	"context"
	"database/sql"
	"fmt"
	"github/pos/internal/model"
	possql "github/pos/internal/storage/sql"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type AssetRepository struct {
	db *sqlx.DB
}

func NewAssetRepository(db *sqlx.DB) *AssetRepository {
	return &AssetRepository{db: db}
}

// Create creates a new asset
func (r *AssetRepository) Create(ctx context.Context, asset *model.Asset) error {
	return possql.RunInTx(ctx, r.db, func(tx *sqlx.Tx) error {
		query := `INSERT INTO assets (name, mime, size, width, height, url, thumb_url)
		          VALUES ($1, $2, $3, $4, $5, $6, $7)
		          RETURNING id, created_at`

		err := tx.QueryRowContext(ctx, query,
			asset.Name,
			asset.Mime,
			asset.Size,
			asset.Width,
			asset.Height,
			asset.URL,
			asset.ThumbURL,
		).Scan(&asset.ID, &asset.CreatedAt)

		if err != nil {
			return fmt.Errorf("failed to create asset: %w", err)
		}

		return nil
	})
}

// GetByID retrieves an asset by ID
func (r *AssetRepository) GetByID(ctx context.Context, id string) (*model.Asset, error) {
	var asset model.Asset
	query := `SELECT id, name, mime, size, width, height, url, thumb_url, created_at
	          FROM assets WHERE id = $1`

	err := r.db.GetContext(ctx, &asset, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get asset: %w", err)
	}

	return &asset, nil
}

// GetByIDs retrieves multiple assets by IDs
func (r *AssetRepository) GetByIDs(ctx context.Context, ids []string) ([]model.Asset, error) {
	if len(ids) == 0 {
		return []model.Asset{}, nil
	}

	query := `SELECT id, name, mime, size, width, height, url, thumb_url, created_at
	          FROM assets WHERE id = ANY($1)`

	var assets []model.Asset
	err := r.db.SelectContext(ctx, &assets, query, pq.Array(ids))
	if err != nil {
		return nil, fmt.Errorf("failed to get assets: %w", err)
	}

	return assets, nil
}

// Delete deletes an asset
func (r *AssetRepository) Delete(ctx context.Context, id string) error {
	return possql.RunInTx(ctx, r.db, func(tx *sqlx.Tx) error {
		query := `DELETE FROM assets WHERE id = $1`

		result, err := tx.ExecContext(ctx, query, id)
		if err != nil {
			return fmt.Errorf("failed to delete asset: %w", err)
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			return fmt.Errorf("failed to get rows affected: %w", err)
		}

		if rowsAffected == 0 {
			return fmt.Errorf("asset not found")
		}

		return nil
	})
}
