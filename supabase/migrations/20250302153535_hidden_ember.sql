/*
  # Add test user for authentication

  1. New Data
    - Add a test user for authentication testing
  2. Security
    - User will be able to sign in with email/password
*/

-- Insert a test user into auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at
)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test User"}',
  now()
);

-- Insert the user into our users table
INSERT INTO users (
  id,
  name,
  email,
  department,
  role
)
SELECT 
  id,
  'Test User',
  'test@example.com',
  'IT Department',
  'staff'
FROM auth.users
WHERE email = 'test@example.com';