DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
DROP TRIGGER IF EXISTS update_product_option_values_updated_at ON product_option_values;
DROP TRIGGER IF EXISTS update_product_option_groups_updated_at ON product_option_groups;

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_variant_id_fkey;
DROP INDEX IF EXISTS idx_order_items_product_variant_id;
ALTER TABLE order_items DROP COLUMN IF EXISTS product_variant_id;

DROP INDEX IF EXISTS idx_product_variants_unique_active_options;
DROP INDEX IF EXISTS idx_product_variants_deleted_at;
DROP INDEX IF EXISTS idx_product_variants_option_values;
DROP INDEX IF EXISTS idx_product_variants_product_id;
DROP TABLE IF EXISTS product_variants;

DROP INDEX IF EXISTS idx_product_option_values_deleted_at;
DROP INDEX IF EXISTS idx_product_option_values_option_group_id;
DROP TABLE IF EXISTS product_option_values;

DROP INDEX IF EXISTS idx_product_option_groups_deleted_at;
DROP INDEX IF EXISTS idx_product_option_groups_product_id;
DROP TABLE IF EXISTS product_option_groups;

ALTER TABLE products
    DROP COLUMN IF EXISTS has_variants,
    DROP COLUMN IF EXISTS sale_status,
    DROP COLUMN IF EXISTS quantity;
