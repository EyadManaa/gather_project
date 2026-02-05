-- PostgreSQL Schema for Supabase Migration (Converted from MySQL Dump)

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('basic', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user',
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  address TEXT
);

-- Stores Table
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  profile_pic VARCHAR(255),
  banner VARCHAR(255),
  profit_percentage DECIMAL(5, 2) DEFAULT 0.00,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  visitors INTEGER DEFAULT 0,
  is_open BOOLEAN DEFAULT TRUE,
  about_content TEXT,
  instagram_link VARCHAR(255),
  tiktok_link VARCHAR(255),
  facebook_link VARCHAR(255),
  linkedin_link VARCHAR(255),
  subscription_tier subscription_tier DEFAULT 'basic',
  opening_time TIME,
  closing_time TIME,
  category VARCHAR(100) DEFAULT 'General',
  order_count INTEGER DEFAULT 0
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  section VARCHAR(255) DEFAULT 'General',
  is_out_of_stock BOOLEAN DEFAULT FALSE,
  sales_count INTEGER DEFAULT 0
);

-- Carts Table
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, store_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  location TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_option VARCHAR(20) DEFAULT 'pickup',
  order_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Store Bans Table
CREATE TABLE IF NOT EXISTS store_bans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, store_id)
);

-- Store Nav Sections Table
CREATE TABLE IF NOT EXISTS store_nav_sections (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  section_id VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_sections (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Store Ratings Table
CREATE TABLE IF NOT EXISTS store_ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Store Visits Table
CREATE TABLE IF NOT EXISTS store_visits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  features TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  duration_days INTEGER DEFAULT 30
);

-- Upgrade Requests Table
CREATE TABLE IF NOT EXISTS upgrade_requests (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  current_tier subscription_tier NOT NULL,
  requested_tier subscription_tier NOT NULL,
  message TEXT,
  status request_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Data Migration (Dumping data)

-- Users
INSERT INTO users (id, username, email, password, role, is_banned, created_at, address) VALUES
(1, 'eyad', 'eyadMana72@gmail.com', '$2a$10$shPPdD6FrKNLdG7IC49fYewxl2MbeDYWmUPVeLiMxE/CMSvQYpIYm', 'admin', FALSE, '2026-01-22 23:05:49', '123 Emerald St, Green City, GC 12345'),
(2, 'wow', 'cellf7220@gmail.com', '$2a$10$Nu.MhV1t0DRXfVBxC7MgCeKHiXCgVK89LoFg.52QbHWBbBPRIXidC', 'user', FALSE, '2026-01-23 09:45:52', NULL),
(3, 'meow', 'meow@gmail.com', '$2a$10$WMZ7ga7pqz/i9WqqQO/IM.RLFeusGhm9UKhSc3.RhjZMVNfHi.UrC', 'user', FALSE, '2026-01-23 09:47:03', NULL),
(4, 'admin', 'admin@gmail.com', '$2a$10$9a9TzVmC2bPHSIysYdZXJutZuYyxROkrT9gBlsAITTikvrDA0ApAe', 'admin', FALSE, '2026-01-23 10:54:49', '123 Emerald St, Green City, GC 12345'),
(5, 'SuperAdmin', 'superadmin@gther.com', '$2a$10$huRJ0uMfGu4PqMk5K49jhuKN42tM7CEFPnRCwbtgXlVY3mSHUfcy6', 'super_admin', FALSE, '2026-01-25 15:23:20', NULL),
(6, 'Euad', 'eyad@gmail.com', '$2a$10$Fo.8bVHCxjnIipWYQm/H/uB8jkR04OoZ4Ea08IJcxy/ab2ge/SWAW', 'user', TRUE, '2026-01-26 10:55:54', NULL),
(7, '1', 'koki@gmail.com', '$2a$10$VwFuFrYrb4pVIYMqd62.iObcs.6GK5088ucQKPpU2Ig4oZjr0YfxS', 'admin', FALSE, '2026-01-26 22:12:44', NULL)
ON CONFLICT (id) DO NOTHING;

-- Stores
INSERT INTO stores (id, owner_id, name, description, profile_pic, banner, profit_percentage, is_banned, created_at, visitors, is_open, about_content, instagram_link, tiktok_link, facebook_link, linkedin_link, subscription_tier, opening_time, closing_time, category, order_count) VALUES
(1, 1, 'ooiko', 'ouyuyu', NULL, 'http://localhost:5000/uploads/banner-1769124015760.png', 0.00, FALSE, '2026-01-22 23:20:15', 30, TRUE, NULL, NULL, NULL, NULL, NULL, 'pro', NULL, NULL, 'General', 0),
(2, 4, 'greens', 'foooooood', 'http://localhost:5000/uploads/profile_pic-1769166548807.jpg', 'http://localhost:5000/uploads/banner-1769169143524.jpg', 0.00, FALSE, '2026-01-23 10:55:16', 133, FALSE, 'To contact us:\n\nE-mail: greens@gmail.com\nPhone: 00000000\n\nfollow us on:\n\ninsta\nfacebook\n\n', 'https://www.instagram.com/greens.lb/?hl=en', '', '', '', 'pro', '09:00:00', '00:00:00', 'Food', 0),
(3, 7, 'ElectroLab', 'Find all the electronic you need', NULL, NULL, 0.00, FALSE, '2026-01-26 22:13:10', 0, TRUE, '', NULL, NULL, NULL, NULL, 'basic', NULL, NULL, 'Electronics', 0)
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, store_id, name, description, price, image, created_at, section, is_out_of_stock, sales_count) VALUES
(1, 1, 'ahmed', 'yes', 70.00, NULL, '2026-01-22 23:20:44', 'General', FALSE, 0),
(2, 2, 'yyy', 'eee', 90.00, 'http://localhost:5000/uploads/image-1769165773484.png', '2026-01-23 10:56:13', 'General', FALSE, 0),
(4, 2, 'we', 'eeeeee', 20.00, 'http://localhost:5000/uploads/image-1769418541848.jpeg', '2026-01-23 12:12:50', 'idk', FALSE, 0),
(5, 2, 'Beef Burger', 'a jucie red meat burger with etc', 9.00, NULL, '2026-01-26 09:32:54', 'General', FALSE, 0),
(6, 2, 'food', 'hhhaahaha', 80.00, NULL, '2026-01-26 12:53:18', 'idk', FALSE, 0)
ON CONFLICT (id) DO NOTHING;

-- Carts
INSERT INTO carts (id, user_id, product_id, quantity) VALUES
(1, 1, 1, 1),
(2, 1, 1, 1),
(3, 1, 1, 1),
(4, 2, 1, 1)
ON CONFLICT (id) DO NOTHING;

-- Favorites
INSERT INTO favorites (id, user_id, store_id, created_at) VALUES
(1, 4, 2, '2026-01-23 17:12:52'),
(7, 3, 2, '2026-01-24 17:07:17'),
(9, 3, 1, '2026-01-26 08:21:48')
ON CONFLICT (id) DO NOTHING;

-- Orders
INSERT INTO orders (id, user_id, store_id, phone_number, location, total_amount, delivery_option, order_notes, status, created_at) VALUES
(1, 3, 1, '', NULL, 70.00, 'pickup', NULL, 'finished', '2026-01-23 10:49:40'),
(3, 3, 2, '32330148', 'wen kan fe aana la aayad w la zene', 185.00, 'delivery', 'no', 'finished', '2026-01-23 14:54:22'),
(4, 4, 2, '344343434343', '', 360.00, 'pickup', '', 'finished', '2026-01-24 17:37:57'),
(5, 4, 2, '33333333333', '', 90.00, 'pickup', '', 'finished', '2026-01-24 17:39:49'),
(6, 4, 2, '222222222', '', 90.00, 'pickup', '', 'finished', '2026-01-24 17:41:19'),
(7, 3, 1, '', NULL, 109.11, 'pickup', NULL, 'completed', '2026-01-21 13:37:23'),
(8, 2, 1, '', NULL, 85.62, 'pickup', NULL, 'completed', '2026-01-24 13:37:23'),
(9, 3, 2, '', NULL, 104.39, 'pickup', NULL, 'completed', '2026-01-22 13:37:23'),
(10, 3, 1, '', NULL, 41.23, 'pickup', NULL, 'completed', '2026-01-24 13:37:23'),
(11, 2, 1, '', NULL, 20.15, 'pickup', NULL, 'completed', '2026-01-23 13:37:23'),
(12, 2, 2, '', NULL, 109.72, 'pickup', NULL, 'completed', '2026-01-24 13:37:23'),
(13, 2, 2, '', NULL, 90.34, 'pickup', NULL, 'completed', '2026-01-12 13:37:23'),
(14, 3, 1, '', NULL, 21.12, 'pickup', NULL, 'completed', '2026-01-18 13:37:23'),
(15, 2, 1, '', NULL, 90.99, 'pickup', NULL, 'completed', '2026-01-13 13:37:23'),
(16, 2, 1, '', NULL, 34.29, 'pickup', NULL, 'completed', '2026-01-14 13:37:23'),
(17, 3, 1, '', NULL, 107.65, 'pickup', NULL, 'completed', '2026-01-19 13:37:23'),
(18, 2, 1, '', NULL, 29.78, 'pickup', NULL, 'completed', '2026-01-14 13:37:23'),
(19, 2, 1, '', NULL, 66.64, 'pickup', NULL, 'completed', '2026-01-17 13:37:23'),
(20, 2, 2, '', NULL, 36.56, 'pickup', NULL, 'completed', '2026-01-15 13:37:23'),
(21, 3, 1, '', NULL, 68.90, 'pickup', NULL, 'completed', '2026-01-17 13:37:23'),
(22, 2, 2, '', NULL, 35.75, 'pickup', NULL, 'completed', '2026-01-20 13:37:23'),
(23, 3, 2, '', NULL, 93.85, 'pickup', NULL, 'completed', '2026-01-24 13:37:23'),
(24, 3, 1, '', NULL, 24.75, 'pickup', NULL, 'completed', '2026-01-23 13:37:23'),
(25, 3, 2, '', NULL, 108.86, 'pickup', NULL, 'completed', '2026-01-23 13:37:23'),
(26, 2, 1, '', NULL, 57.80, 'pickup', NULL, 'completed', '2026-01-17 13:37:23'),
(27, 3, 2, '332323232332', 'siahisus', 185.00, 'delivery', '', 'finished', '2026-01-26 08:25:28')
ON CONFLICT (id) DO NOTHING;

-- Reviews
INSERT INTO reviews (id, user_id, store_id, rating, comment, image_url, created_at) VALUES
(1, 4, 2, 3, 'www', '', '2026-01-23 11:35:49'),
(7, 3, 2, 3, 'eeee', NULL, '2026-01-24 17:30:42'),
(8, 3, 2, 5, 'oeoeo', NULL, '2026-01-24 17:30:47'),
(9, 3, 2, 5, 'mmm\r\n', NULL, '2026-01-26 10:34:24'),
(10, 3, 2, 4, '', NULL, '2026-01-26 10:39:54'),
(11, 3, 2, 5, '', NULL, '2026-01-26 10:40:08')
ON CONFLICT (id) DO NOTHING;

-- Store Nav Sections
INSERT INTO store_nav_sections (id, store_id, label, section_id, order_index, created_at) VALUES
(2, 2, 'Reviews', 'reviews', 2, '2026-01-23 12:04:39'),
(3, 2, 'General', 'general', 3, '2026-01-23 12:24:37'),
(7, 2, 'About Us', 'about', 3, '2026-01-23 16:49:09')
ON CONFLICT (id) DO NOTHING;

-- Store Ratings
INSERT INTO store_ratings (id, user_id, store_id, score, created_at, updated_at) VALUES
(1, 3, 2, 4, '2026-01-26 10:53:19', '2026-01-26 10:55:13'),
(5, 6, 2, 2, '2026-01-26 10:56:03', '2026-01-26 10:56:10')
ON CONFLICT (id) DO NOTHING;

-- Store Visits
INSERT INTO store_visits (id, user_id, store_id, visited_at) VALUES
(1, 3, 2, '2026-01-23 13:50:09'),
(2, 3, 2, '2026-01-23 13:50:15'),
(3, 3, 1, '2026-01-23 13:50:28'),
(4, 3, 1, '2026-01-23 14:42:24'),
(5, 3, 1, '2026-01-23 14:45:01'),
(6, 3, 1, '2026-01-23 14:46:58'),
(7, 3, 1, '2026-01-23 14:47:01'),
(8, 3, 1, '2026-01-23 14:47:06'),
(9, 3, 1, '2026-01-23 14:47:09'),
(10, 4, 2, '2026-01-23 14:54:53'),
(11, 4, 2, '2026-01-23 15:39:32'),
(12, 4, 2, '2026-01-23 15:47:58'),
(13, 4, 2, '2026-01-23 15:50:15'),
(14, 4, 2, '2026-01-23 15:56:22'),
(15, 4, 2, '2026-01-23 15:58:12'),
(16, 4, 2, '2026-01-23 16:20:18'),
(17, 3, 2, '2026-01-23 16:29:25'),
(18, 4, 2, '2026-01-23 16:44:44'),
(19, 4, 2, '2026-01-23 16:45:32'),
(20, 4, 2, '2026-01-23 16:46:15'),
(21, 4, 2, '2026-01-23 16:49:16'),
(22, 4, 2, '2026-01-23 16:51:26'),
(23, 4, 2, '2026-01-23 17:01:39'),
(24, 4, 2, '2026-01-23 17:12:56'),
(25, 4, 2, '2026-01-23 17:18:22'),
(26, 4, 2, '2026-01-23 17:43:11'),
(27, 4, 2, '2026-01-23 18:14:52'),
(28, 3, 2, '2026-01-24 13:29:43'),
(29, 4, 2, '2026-01-24 13:46:18'),
(30, 4, 2, '2026-01-24 13:47:22'),
(31, 4, 2, '2026-01-24 15:14:46'),
(32, 4, 2, '2026-01-24 15:25:41'),
(33, 4, 1, '2026-01-24 15:28:01'),
(34, 4, 2, '2026-01-24 15:29:23'),
(35, 3, 2, '2026-01-24 16:25:55'),
(36, 3, 2, '2026-01-24 16:26:05'),
(37, 3, 2, '2026-01-24 16:26:15'),
(38, 3, 2, '2026-01-24 16:26:29'),
(39, 3, 2, '2026-01-24 16:59:10'),
(40, 3, 2, '2026-01-24 17:00:45'),
(41, 3, 2, '2026-01-24 17:00:53'),
(42, 3, 2, '2026-01-24 17:01:01'),
(43, 3, 2, '2026-01-24 17:01:07'),
(44, 3, 2, '2026-01-24 17:01:11'),
(45, 3, 2, '2026-01-24 17:01:19'),
(46, 3, 2, '2026-01-24 17:01:38'),
(47, 3, 2, '2026-01-24 17:03:44'),
(48, 3, 1, '2026-01-24 17:05:47'),
(49, 3, 2, '2026-01-24 17:07:41'),
(50, 3, 2, '2026-01-24 17:09:38'),
(51, 3, 2, '2026-01-24 17:10:59'),
(52, 3, 1, '2026-01-24 17:11:42'),
(53, 3, 2, '2026-01-24 17:11:47'),
(54, 3, 2, '2026-01-24 17:12:49'),
(55, 3, 2, '2026-01-24 17:19:12'),
(56, 3, 2, '2026-01-24 17:24:36'),
(57, 3, 2, '2026-01-24 17:24:58'),
(58, 3, 2, '2026-01-24 17:25:08'),
(59, 3, 2, '2026-01-24 17:28:22'),
(60, 3, 2, '2026-01-24 17:30:09'),
(61, 4, 2, '2026-01-24 17:32:19'),
(62, 4, 2, '2026-01-24 17:35:54'),
(63, 4, 2, '2026-01-24 17:37:34'),
(64, 4, 2, '2026-01-24 17:43:07'),
(65, 4, 2, '2026-01-24 17:44:39'),
(66, 5, 1, '2026-01-25 15:40:25'),
(67, 5, 1, '2026-01-25 15:41:19'),
(68, 5, 1, '2026-01-25 15:43:24'),
(69, 5, 2, '2026-01-25 15:45:56'),
(70, 5, 1, '2026-01-25 15:46:15'),
(71, 5, 2, '2026-01-25 15:46:37'),
(72, 5, 2, '2026-01-25 15:49:18'),
(73, 5, 2, '2026-01-25 15:50:52'),
(74, 5, 1, '2026-01-25 15:51:05'),
(75, 5, 1, '2026-01-25 15:51:33'),
(76, 5, 1, '2026-01-25 15:51:33'),
(77, 5, 1, '2026-01-25 15:53:13'),
(78, 5, 1, '2026-01-25 15:53:18'),
(79, 5, 1, '2026-01-25 15:53:28'),
(80, 3, 1, '2026-01-25 16:58:28'),
(81, 3, 2, '2026-01-25 16:58:40'),
(82, 3, 1, '2026-01-25 17:01:53'),
(83, 3, 2, '2026-01-25 17:01:59'),
(84, 3, 2, '2026-01-25 17:03:53'),
(85, 3, 2, '2026-01-26 08:21:55'),
(86, 3, 2, '2026-01-26 08:22:32'),
(87, 4, 2, '2026-01-26 08:33:46'),
(88, 5, 2, '2026-01-26 08:43:55'),
(89, 4, 2, '2026-01-26 09:09:49'),
(90, 4, 2, '2026-01-26 09:33:08'),
(91, 4, 2, '2026-01-26 09:34:11'),
(92, 4, 2, '2026-01-26 09:54:15'),
(93, 4, 2, '2026-01-26 10:21:30'),
(94, 3, 2, '2026-01-26 10:34:06'),
(95, 3, 2, '2026-01-26 10:34:40'),
(96, 3, 2, '2026-01-26 10:50:33'),
(97, 3, 2, '2026-01-26 10:53:37'),
(98, 3, 2, '2026-01-26 10:54:15'),
(100, 6, 2, '2026-01-26 10:55:59'),
(101, 6, 2, '2026-01-26 10:56:27'),
(102, 4, 2, '2026-01-26 10:59:31'),
(103, 4, 2, '2026-01-26 11:00:54'),
(104, 4, 2, '2026-01-26 12:56:02'),
(105, 4, 2, '2026-01-26 18:37:30'),
(106, 4, 1, '2026-01-26 18:53:55'),
(107, 4, 2, '2026-01-26 18:54:02'),
(108, 3, 2, '2026-01-26 19:02:56'),
(109, 4, 2, '2026-01-26 22:07:00'),
(110, 5, 1, '2026-01-26 22:09:12'),
(111, 3, 2, '2026-01-26 22:11:22')
ON CONFLICT (id) DO NOTHING;

-- Subscriptions
INSERT INTO subscriptions (id, name, price, features, updated_at, duration_days) VALUES
(1, 'Basic', 0.00, '10 Products, Basic Analytics, Standard Support', '2026-01-25 15:35:37', 30),
(2, 'Pro', 29.00, 'Unlimited Products, Advanced Analytics, Priority Support\n', '2026-01-26 11:16:58', 30),
(3, 'Enterprise', 99.00, 'Everything in Pro, Dedicated Manager, More Access Time', '2026-01-26 12:02:14', 365)
ON CONFLICT (id) DO NOTHING;

-- Upgrade Requests
INSERT INTO upgrade_requests (id, store_id, current_tier, requested_tier, message, status, created_at, updated_at) VALUES
(1, 2, 'basic', 'pro', 'pleaseee maan i need this', 'approved', '2026-01-26 12:42:53', '2026-01-26 12:43:44'),
(2, 2, 'pro', 'enterprise', 'ueuuee', 'approved', '2026-01-26 12:56:36', '2026-01-26 18:17:21'),
(3, 2, 'enterprise', 'pro', 'iiii', 'approved', '2026-01-26 22:06:26', '2026-01-26 22:08:19'),
(4, 1, 'basic', 'pro', 'ooo', 'approved', '2026-01-26 22:10:23', '2026-01-26 22:12:15'),
(5, 3, 'basic', 'pro', 'p', 'pending', '2026-01-26 22:13:22', '2026-01-26 22:13:22')
ON CONFLICT (id) DO NOTHING;

-- Reset Sequences
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('stores', 'id'), (SELECT MAX(id) FROM stores));
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products));
SELECT setval(pg_get_serial_sequence('carts', 'id'), (SELECT MAX(id) FROM carts));
SELECT setval(pg_get_serial_sequence('favorites', 'id'), (SELECT MAX(id) FROM favorites));
SELECT setval(pg_get_serial_sequence('orders', 'id'), (SELECT MAX(id) FROM orders));
SELECT setval(pg_get_serial_sequence('reviews', 'id'), (SELECT MAX(id) FROM reviews));
SELECT setval(pg_get_serial_sequence('store_nav_sections', 'id'), (SELECT MAX(id) FROM store_nav_sections));
SELECT setval(pg_get_serial_sequence('store_ratings', 'id'), (SELECT MAX(id) FROM store_ratings));
SELECT setval(pg_get_serial_sequence('store_visits', 'id'), (SELECT MAX(id) FROM store_visits));
SELECT setval(pg_get_serial_sequence('subscriptions', 'id'), (SELECT MAX(id) FROM subscriptions));
SELECT setval(pg_get_serial_sequence('upgrade_requests', 'id'), (SELECT MAX(id) FROM upgrade_requests));
