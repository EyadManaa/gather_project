-- Consolidated PostgreSQL Schema for Supabase Migration

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- 'user', 'admin', 'super_admin'
  address TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INT NOT NULL,
  features TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Stores table
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  profile_pic TEXT,
  banner TEXT,
  profit_percentage DECIMAL(5, 2) DEFAULT 0,
  is_open BOOLEAN DEFAULT TRUE,
  is_banned BOOLEAN DEFAULT FALSE,
  visitors INT DEFAULT 0,
  order_count INT DEFAULT 0,
  about_content TEXT,
  instagram_link TEXT,
  tiktok_link TEXT,
  facebook_link TEXT,
  linkedin_link TEXT,
  opening_time TIME,
  closing_time TIME,
  category VARCHAR(100) DEFAULT 'General',
  subscription_tier VARCHAR(50) DEFAULT 'basic',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  category VARCHAR(100), -- Old field, keeping for compatibility if needed
  section VARCHAR(255) DEFAULT 'General',
  sales_count INT DEFAULT 0,
  is_out_of_stock BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Carts table
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_option VARCHAR(20) DEFAULT 'pickup',
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
  phone_number VARCHAR(20),
  order_notes TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Store Ratings table
CREATE TABLE IF NOT EXISTS store_ratings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, store_id)
);

-- 9. Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, store_id)
);

-- 10. Store Visits table
CREATE TABLE IF NOT EXISTS store_visits (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Store Bans table
CREATE TABLE IF NOT EXISTS store_bans (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, store_id)
);

-- 12. Store Nav Sections table
CREATE TABLE IF NOT EXISTS store_nav_sections (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  section_id VARCHAR(255) NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Upgrade Requests table
CREATE TABLE IF NOT EXISTS upgrade_requests (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  current_tier VARCHAR(50),
  requested_tier VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data
DELETE FROM subscriptions;
INSERT INTO subscriptions (name, price, duration_days, features) VALUES
('Basic', 0.00, 0, 'Standard store listing'),
('Pro', 19.99, 30, 'Custom navigation, priority listing, advanced stats'),
('Enterprise', 49.99, 30, 'All features + dedicated support, 0% commission');

-- Create a Super Admin (Default password: password123)
-- Hash: $2a$10$W2iX0iO4H6HjK8mG9gXvUuJ.z/h7YyY5yY5yY5yY5yY5yY5yY5yY5
-- Replace this with your own secure hash or use the registration endpoint.
-- INSERT INTO users (username, email, password, role) VALUES ('superadmin', 'admin@gather.com', '$2a$10$W2iX0iO4H6HjK8mG9gXvUuJ.z/h7YyY5yY5yY5yY5yY5yY5yY5yY5', 'super_admin');
