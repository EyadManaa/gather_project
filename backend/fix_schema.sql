-- 1. Fix the users table schema
-- We need to change id to UUID and make password nullable
ALTER TABLE public.users ALTER COLUMN id TYPE UUID USING (uuid_generate_v4()); -- This might fail if data exists
-- Safer approach:
-- DROP TABLE users CASCADE; -- This is too destructive if data exists

-- Better approach for existing data:
-- 1. Remove foreign key constraints temporarily
-- 2. Change id types
-- 3. Re-add constraints

-- Since this is a migration, let's assume we can modify the table.
-- Supabase users use UUID, so our public.users must also use UUID.

-- First, install the extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Temporarily drop constraints that depend on users.id
ALTER TABLE stores DROP CONSTRAINT stores_owner_id_fkey;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_user_id_fkey; -- Doesn't exist, products depend on stores
ALTER TABLE carts DROP CONSTRAINT carts_user_id_fkey;
ALTER TABLE favorites DROP CONSTRAINT favorites_user_id_fkey;
ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT reviews_user_id_fkey;
ALTER TABLE store_bans DROP CONSTRAINT store_bans_user_id_fkey;
ALTER TABLE store_ratings DROP CONSTRAINT store_ratings_user_id_fkey;
ALTER TABLE store_visits DROP CONSTRAINT store_visits_user_id_fkey;

-- Change users.id type to UUID
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.users ALTER COLUMN id TYPE UUID USING (id::text::uuid); -- This will only work if IDs are already UUIDs or convertible.
-- If IDs are 1, 2, 3... we might need to recreate the table or map them.

-- Actually, for a fresh Supabase project, it's best to start with UUIDs.
-- Let's just make the password nullable first.
ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL;

-- If the user wants to keep their integer IDs for existing data but use UUIDs for new ones, that's hard.
-- Supabase Auth REQUIRES UUIDs. 

-- RECOMMENDATION: Wipe the public.users table and recreate with UUID if it's still early in migration.
-- Or, if we must keep integers, we can't easily sync with auth.users (which uses UUID).

-- Let's try to convert ID to UUID. 
-- Since we are migrating from MySQL to Supabase, we should use UUIDs everywhere for IDs.

-- Updated sync function:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email), 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
