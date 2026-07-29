-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- SEED SINGLE SUPER ADMIN IN SUPABASE AUTH & PUBLIC SCHEMA
DO $$
DECLARE
  super_admin_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
  super_admin_email TEXT := 'vishnu@trash2treasure.co.in';
  super_admin_name TEXT := 'Super Admin';
  -- Default pre-hashed password for Password123! using bcrypt ($2a$12$...)
  hashed_password TEXT := '$2a$12$R.W39s3nEOn8w/f5p.g/n.M7bL4J7z41Z5h.1R2Q/2/u5V1234567';
BEGIN
  -- 1. Insert into auth.users (Supabase Auth)
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    super_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    super_admin_email,
    crypt('admin@t2t', gen_salt('bf', 10)),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Super Admin","role":"Super Admin"}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  -- 2. Insert into public.users
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    status,
    points,
    waste_submitted,
    joined_at,
    created_at,
    updated_at
  )
  VALUES (
    super_admin_id,
    super_admin_email,
    super_admin_name,
    'Super Admin',
    'Active',
    0,
    0,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = 'Super Admin',
    updated_at = NOW();

  -- 3. Insert into public.admins (Admin Portal explicit record)
  INSERT INTO public.admins (
    id,
    user_id,
    email,
    name,
    password,
    role,
    is_locked,
    login_attempts,
    created_at,
    updated_at
  )
  VALUES (
    super_admin_id,
    super_admin_id,
    super_admin_email,
    super_admin_name,
    crypt('admin@t2t', gen_salt('bf', 10)),
    'Super Admin',
    FALSE,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = 'Super Admin',
    updated_at = NOW();

END $$;
