-- Drop triggers
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_discount_rules_updated_at ON discount_rules;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_product_specifications_updated_at ON product_specifications;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TYPE IF EXISTS order_status;
DROP TABLE IF EXISTS discount_rules;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_specifications;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS assets;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";
