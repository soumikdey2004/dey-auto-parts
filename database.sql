CREATE DATABASE IF NOT EXISTS dey_auto_parts;
USE dey_auto_parts;

-- Default password is password123. Change it immediately after your first login.
CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL,
  password_hash CHAR(128) NOT NULL,
  password_salt CHAR(48) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_admin_username (username)
);
INSERT IGNORE INTO admins (username, password_hash, password_salt) VALUES
('admin', 'cd1fba42285b1831ac8a77805d80928222dfa04eea60d664e2be894d6a3ac514a7c64633ace7385ee631d1a9e9caa02c090b4bf85ad3260af8afb63872ec3024', 'ed426924c5fbc57669e45cb655d6e6ea172ff0cfa56983e2');

CREATE TABLE IF NOT EXISTS bike_models (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  brand_name VARCHAR(80) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  model_year SMALLINT UNSIGNED NULL,
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_brand_model_year (brand_name, model_name, model_year),
  KEY idx_brand (brand_name)
);

CREATE TABLE IF NOT EXISTS spare_parts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  model_id INT UNSIGNED NOT NULL,
  part_name VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  image_url VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_parts_model FOREIGN KEY (model_id) REFERENCES bike_models(id) ON DELETE CASCADE,
  KEY idx_part_model (model_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  payment_method ENUM('upi','card','cod','netbanking') NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('placed','paid','cancelled') NOT NULL DEFAULT 'placed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Apply this when upgrading an existing database created before COD support.
ALTER TABLE orders MODIFY payment_method ENUM('upi','card','cod','netbanking') NOT NULL;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  spare_part_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_part FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id),
  KEY idx_order_items_order (order_id)
);

INSERT IGNORE INTO bike_models (id, brand_name, model_name, model_year, image_url) VALUES
 (1, 'KTM', 'Duke 200', 2024, 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80'),
 (2, 'KTM', 'Duke 390', 2024, 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80'),
 (3, 'Hero', 'Splendor Plus', 2024, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80'),
 (4, 'Hero', 'HF Deluxe', 2024, 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80');
INSERT IGNORE INTO spare_parts (id, model_id, part_name, category, price, stock_quantity) VALUES
 (1, 1, 'Air Filter', 'Engine Parts', 499.00, 20), (2, 1, 'Front Brake Pads', 'Brake Systems', 799.00, 15),
 (3, 2, 'Oil Filter', 'Engine Parts', 650.00, 18), (4, 2, 'Drive Chain Kit', 'Transmission', 3299.00, 8),
 (5, 3, 'Air Filter', 'Engine Parts', 249.00, 30), (6, 3, 'Brake Shoe Set', 'Brake Systems', 349.00, 25),
 (7, 4, 'Spark Plug', 'Electrical', 199.00, 40), (8, 4, 'Clutch Plate Set', 'Engine Parts', 899.00, 12);
