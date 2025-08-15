CREATE DATABASE IF NOT EXISTS hall_booking;

USE hall_booking;

CREATE TABLE IF NOT EXISTS halls (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  amenities JSON,
  description TEXT,
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO halls (id, name, location, capacity, amenities, description, image_url, is_active) VALUES
  (UUID(), 'A-Block Conference Hall', '1st Floor, A Block', 200, '["Projector", "Sound System", "Air Conditioning"]', 'A spacious conference hall suitable for academic events, seminars, and presentations.', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800&h=600', true),
  (UUID(), 'B-Block Auditorium', 'Ground Floor, B Block', 500, '["Stage", "Professional Sound System", "Lighting System", "Green Room"]', 'Our largest venue with full stage setup, perfect for performances, convocations, and large gatherings.', 'https://images.unsplash.com/photo-1526041092449-209d556f7a32?auto=format&fit=crop&q=80&w=800&h=600', true),
  (UUID(), 'Delany Hall', 'Main Building', 300, '["Projector", "Sound System", "Stage"]', 'A versatile hall named after our founder, suitable for medium-sized events and ceremonies.', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800&h=600', true);