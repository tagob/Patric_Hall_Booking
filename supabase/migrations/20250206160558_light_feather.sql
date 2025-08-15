/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `password_hash` (text)
      - `department` (text)
      - `role` (text)
      - `created_at` (timestamp)
    - `halls`
      - `id` (uuid, primary key)
      - `name` (text)
      - `location` (text)
      - `capacity` (integer)
      - `amenities` (jsonb)
      - `description` (text)
      - `image_url` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    - `bookings`
      - `id` (uuid, primary key)
      - `hall_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `purpose` (text)
      - `attendees` (integer)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  department text,
  role text NOT NULL DEFAULT 'staff',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create halls table
CREATE TABLE IF NOT EXISTS halls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  location text NOT NULL,
  capacity integer NOT NULL,
  amenities jsonb DEFAULT '[]'::jsonb,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE halls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read halls"
  ON halls
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify halls"
  ON halls
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id uuid REFERENCES halls(id),
  user_id uuid REFERENCES users(id),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  purpose text NOT NULL,
  attendees integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_hall_date ON bookings(hall_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);