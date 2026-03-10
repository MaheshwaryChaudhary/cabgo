import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('cabgo.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('rider', 'driver')) NOT NULL,
    profile_pic TEXT,
    rating REAL DEFAULT 5.0,
    is_online INTEGER DEFAULT 1,
    car_model TEXT,
    phone TEXT,
    lat REAL,
    lng REAL
  );

  CREATE TABLE IF NOT EXISTS rides (
    id TEXT PRIMARY KEY,
    rider_id TEXT NOT NULL,
    driver_id TEXT,
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    pickup_lat REAL NOT NULL,
    pickup_lng REAL NOT NULL,
    dropoff_lat REAL NOT NULL,
    dropoff_lng REAL NOT NULL,
    type TEXT DEFAULT 'standard',
    promo_code TEXT,
    status TEXT CHECK(status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'requested',
    fare REAL,
    scheduled_at DATETIME,
    cancellation_reason TEXT,
    driver_cancellation_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(rider_id) REFERENCES users(id),
    FOREIGN KEY(driver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    ride_id TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ride_id) REFERENCES rides(id)
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id TEXT PRIMARY KEY,
    ride_id TEXT NOT NULL,
    driver_id TEXT NOT NULL,
    rider_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ride_id) REFERENCES rides(id),
    FOREIGN KEY(driver_id) REFERENCES users(id),
    FOREIGN KEY(rider_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS promo_codes (
    code TEXT PRIMARY KEY,
    discount_percent INTEGER NOT NULL,
    expiry_date DATETIME,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS favorite_drivers (
    rider_id TEXT NOT NULL,
    driver_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (rider_id, driver_id),
    FOREIGN KEY(rider_id) REFERENCES users(id),
    FOREIGN KEY(driver_id) REFERENCES users(id)
  );

  -- Insert some default promo codes
  INSERT OR IGNORE INTO promo_codes (code, discount_percent, is_active) VALUES ('CABGO50', 50, 1);
  INSERT OR IGNORE INTO promo_codes (code, discount_percent, is_active) VALUES ('WELCOME20', 20, 1);
  INSERT OR IGNORE INTO promo_codes (code, discount_percent, is_active) VALUES ('SAVE10', 10, 1);
`);

// Ensure 'payment_methods' table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'card', 'wallet', etc.
    last4 TEXT,
    brand TEXT,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

export default db;
