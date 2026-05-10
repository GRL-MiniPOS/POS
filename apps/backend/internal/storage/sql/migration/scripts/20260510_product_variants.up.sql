ALTER TABLE products
    ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    ADD COLUMN IF NOT EXISTS sale_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (sale_status IN ('active', 'inactive')),
    ADD COLUMN IF NOT EXISTS has_variants BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS product_option_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    name VARCHAR(30) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_option_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_group_id UUID NOT NULL,
    value VARCHAR(50) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (option_group_id) REFERENCES product_option_groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    option_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    sale_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (sale_status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_option_groups_product_id ON product_option_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_product_option_groups_deleted_at ON product_option_groups(deleted_at);
CREATE INDEX IF NOT EXISTS idx_product_option_values_option_group_id ON product_option_values(option_group_id);
CREATE INDEX IF NOT EXISTS idx_product_option_values_deleted_at ON product_option_values(deleted_at);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_option_values ON product_variants USING GIN(option_values);
CREATE INDEX IF NOT EXISTS idx_product_variants_deleted_at ON product_variants(deleted_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_unique_active_options
    ON product_variants(product_id, option_values)
    WHERE deleted_at IS NULL;

INSERT INTO product_option_groups (product_id, name, position)
SELECT DISTINCT product_id, '規格', 0
FROM product_specifications
WHERE deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO product_option_values (option_group_id, value, position)
SELECT pog.id, ps.name, ROW_NUMBER() OVER (PARTITION BY pog.id ORDER BY ps.created_at ASC) - 1
FROM product_specifications ps
INNER JOIN product_option_groups pog ON pog.product_id = ps.product_id AND pog.name = '規格' AND pog.deleted_at IS NULL
WHERE ps.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, option_values, quantity, sale_status, created_at, updated_at)
SELECT ps.product_id, jsonb_build_object('規格', ps.name), ps.quantity, 'active', ps.created_at, ps.updated_at
FROM product_specifications ps
WHERE ps.deleted_at IS NULL
ON CONFLICT DO NOTHING;

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS product_variant_id UUID;

ALTER TABLE order_items
    ADD CONSTRAINT order_items_product_variant_id_fkey
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

UPDATE order_items oi
SET product_variant_id = pv.id
FROM product_specifications ps
INNER JOIN product_variants pv ON pv.product_id = ps.product_id AND pv.option_values = jsonb_build_object('規格', ps.name)
WHERE oi.product_specification_id = ps.id;

CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON order_items(product_variant_id);

DROP TRIGGER IF EXISTS update_product_option_groups_updated_at ON product_option_groups;
CREATE TRIGGER update_product_option_groups_updated_at BEFORE UPDATE ON product_option_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_option_values_updated_at ON product_option_values;
CREATE TRIGGER update_product_option_values_updated_at BEFORE UPDATE ON product_option_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
