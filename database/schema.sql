-- Create database (run this separately)
-- CREATE DATABASE agri_dashboard;

-- Connect to database and create tables

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'researcher', 'policymaker')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop yields table
CREATE TABLE crop_yields (
  id SERIAL PRIMARY KEY,
  region VARCHAR(100) NOT NULL,
  crop_type VARCHAR(100) NOT NULL,
  yield_amount DECIMAL(10,2) NOT NULL,
  harvest_date DATE NOT NULL,
  area_hectares DECIMAL(10,2),
  farmer_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather data table
CREATE TABLE weather_data (
  id SERIAL PRIMARY KEY,
  region VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  temperature DECIMAL(5,2),
  rainfall DECIMAL(6,2),
  humidity DECIMAL(5,2),
  wind_speed DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(region, date)
);

-- Soil conditions table
CREATE TABLE soil_conditions (
  id SERIAL PRIMARY KEY,
  region VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  moisture_level DECIMAL(5,2),
  ph_level DECIMAL(4,2),
  nitrogen_level DECIMAL(5,2),
  phosphorus_level DECIMAL(5,2),
  potassium_level DECIMAL(5,2),
  organic_matter DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(region, date)
);

-- Market prices table
CREATE TABLE market_prices (
  id SERIAL PRIMARY KEY,
  commodity VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  market_location VARCHAR(100),
  unit VARCHAR(50) DEFAULT 'per_ton',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(commodity, date, market_location)
);

-- Create indexes for better performance
CREATE INDEX idx_crop_yields_region ON crop_yields(region);
CREATE INDEX idx_crop_yields_date ON crop_yields(harvest_date);
CREATE INDEX idx_crop_yields_type ON crop_yields(crop_type);
CREATE INDEX idx_weather_region_date ON weather_data(region, date);
CREATE INDEX idx_soil_region_date ON soil_conditions(region, date);
CREATE INDEX idx_market_commodity_date ON market_prices(commodity, date);