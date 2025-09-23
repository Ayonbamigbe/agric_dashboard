const pool = require('./config/database');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🏗️  Initializing database schema...');

    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    let schemaSQL;
    
    try {
      schemaSQL = await fs.readFile(schemaPath, 'utf8');
      console.log('📄 Schema file loaded from database/schema.sql');
    } catch (error) {
      console.log('⚠️  Schema file not found, using embedded schema');
      // Fallback embedded schema
      schemaSQL = `
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'researcher', 'policymaker')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Crop yields table
        CREATE TABLE IF NOT EXISTS crop_yields (
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
        CREATE TABLE IF NOT EXISTS weather_data (
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
        CREATE TABLE IF NOT EXISTS soil_conditions (
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
        CREATE TABLE IF NOT EXISTS market_prices (
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
        CREATE INDEX IF NOT EXISTS idx_crop_yields_region ON crop_yields(region);
        CREATE INDEX IF NOT EXISTS idx_crop_yields_date ON crop_yields(harvest_date);
        CREATE INDEX IF NOT EXISTS idx_crop_yields_type ON crop_yields(crop_type);
        CREATE INDEX IF NOT EXISTS idx_weather_region_date ON weather_data(region, date);
        CREATE INDEX IF NOT EXISTS idx_soil_region_date ON soil_conditions(region, date);
        CREATE INDEX IF NOT EXISTS idx_market_commodity_date ON market_prices(commodity, date);
      `;
    }

    // Execute schema
    await pool.query(schemaSQL);
    console.log('✅ Database schema created successfully');

    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    
    const result = await pool.query(tablesQuery);
    console.log('📋 Created tables:', result.rows.map(row => row.table_name).join(', '));

    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initializeDatabase };