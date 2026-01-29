-- ULTIMATE UUID FIX SCRIPT
-- This script drops all tables and re-creates them with UUIDs to match Supabase Auth

-- 1. Disable current triggers to avoid errors during dropped tables
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop all tables with CASCADE to clean up everything
DROP TABLE IF EXISTS store_ratings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS store_nav_sections CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS store_visits CASCADE;
DROP TABLE IF EXISTS store_bans CASCADE;
DROP TABLE IF EXISTS upgrade_requests CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
-- Do NOT drop users if you want to keep them, but since we are doing a clean migrate:
DROP TABLE IF EXISTS users CASCADE;

-- 3. Drop and Recreate ENUMS
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

-- 4. Create Tables with UUIDs
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Matches Supabase auth.users.id
    username VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'user',
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    profile_pic TEXT,
    banner TEXT,
    profit_percentage DECIMAL(5,2) DEFAULT 0,
    is_open BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    visitors INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    category VARCHAR(255) DEFAULT 'General',
    about_content TEXT,
    instagram_link TEXT,
    tiktok_link TEXT,
    facebook_link TEXT,
    linkedin_link TEXT,
    opening_time TIME,
    closing_time TIME,
    subscription_tier subscription_tier DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    section VARCHAR(255) DEFAULT 'General',
    sales_count INTEGER DEFAULT 0,
    is_out_of_stock BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    delivery_option VARCHAR(50),
    phone_number VARCHAR(50),
    order_notes TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL
);

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE store_nav_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    section_id VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE store_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id)
);

CREATE TABLE store_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE store_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id)
);

CREATE TABLE upgrade_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    current_tier subscription_tier,
    requested_tier subscription_tier,
    status request_status DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name subscription_tier UNIQUE,
    price_monthly DECIMAL(10,2),
    features TEXT[]
);

-- 5. Insert seed data for subscriptions
INSERT INTO subscriptions (name, price_monthly, features) VALUES 
('free', 0.00, ARRAY['Up to 5 products', 'Basic stats']),
('basic', 19.99, ARRAY['Up to 50 products', 'Detailed stats', 'Custom navbar']),
('pro', 49.99, ARRAY['Unlimited products', 'Priority support', 'Advanced analytics'])
ON CONFLICT (name) DO NOTHING;

-- 6. Trigger to sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    new.email, 
    CASE 
      WHEN (new.raw_user_meta_data->>'role') = 'admin' THEN 'admin'::public.user_role
      WHEN (new.raw_user_meta_data->>'role') = 'super_admin' THEN 'super_admin'::public.user_role
      ELSE 'user'::public.user_role
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Sync existing auth users to our new public.users table
INSERT INTO public.users (id, username, email, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)), 
    email, 
    CASE 
      WHEN (raw_user_meta_data->>'role') = 'admin' THEN 'admin'::public.user_role
      WHEN (raw_user_meta_data->>'role') = 'super_admin' THEN 'super_admin'::public.user_role
      ELSE 'user'::public.user_role
    END
FROM auth.users
ON CONFLICT (id) DO NOTHING;
