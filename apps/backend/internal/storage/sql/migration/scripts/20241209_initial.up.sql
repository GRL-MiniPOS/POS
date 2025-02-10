CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    parent_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id)
);

CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    price BIGINT NOT NULL,
    stock VARCHAR,
    picture BYTEA,
    category_id INTEGER,
    spec TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

CREATE TABLE customer (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    phone BIGINT,
    address VARCHAR,
    info VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE discount_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    condition TEXT,
    discount TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    discount_id INTEGER,
    order_date TIMESTAMP,
    payment VARCHAR,
    source VARCHAR,
    total_price BIGINT,
    original_price BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (discount_id) REFERENCES discount_rules(id)
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    unit_price BIGINT,
    subtotal BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

-- 在 product 表的 category_id 欄位上創建索引
CREATE INDEX idx_product_category_id ON product(category_id);

-- 在 orders 表的 customer_id 欄位上創建索引
CREATE INDEX idx_order_customer_id ON orders(customer_id);