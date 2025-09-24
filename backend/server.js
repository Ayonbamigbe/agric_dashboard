const app = require('./app');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

// Debug environment variables on startup
console.log('🔍 Environment Debug Info:');
console.log('============================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  try {
    const url = process.env.DATABASE_URL;
    console.log('DATABASE_URL preview:', url.substring(0, 30) + '...');
    
    const dbUrl = new URL(url);
    console.log('Parsed DATABASE_URL:');
    console.log('- Protocol:', dbUrl.protocol);
    console.log('- Host:', dbUrl.hostname);
    console.log('- Port:', dbUrl.port || '5432');
    console.log('- Database:', dbUrl.pathname.substring(1));
    console.log('- Username:', dbUrl.username);
    console.log('- Password exists:', !!dbUrl.password);
  } catch (e) {
    console.error('❌ Invalid DATABASE_URL format:', e.message);
  }
} else {
  console.log('❌ DATABASE_URL not set!');
  console.log('Fallback DB config:');
  console.log('- DB_HOST:', process.env.DB_HOST || 'localhost (DEFAULT)');
  console.log('- DB_PORT:', process.env.DB_PORT || '5432 (DEFAULT)');
  console.log('- DB_NAME:', process.env.DB_NAME || 'agri_dashboard (DEFAULT)');
  console.log('- DB_USER:', process.env.DB_USER || 'postgres (DEFAULT)');
  console.log('- DB_PASSWORD exists:', !!process.env.DB_PASSWORD);
}

console.log('All environment variables:');
Object.keys(process.env)
  .filter(key => key.startsWith('DB') || key.includes('DATABASE') || key === 'JWT_SECRET')
  .forEach(key => {
    const value = process.env[key];
    if (key.includes('PASSWORD') || key.includes('SECRET')) {
      console.log(`${key}: ${value ? '[SET]' : '[NOT SET]'}`);
    } else {
      console.log(`${key}: ${value || '[NOT SET]'}`);
    }
  });

console.log('============================');

// Create database pool with detailed logging
const { Pool } = require('pg');
let pool;

if (process.env.DATABASE_URL) {
  console.log('📡 Using DATABASE_URL for connection');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });
} else {
  console.log('🏠 Using individual DB config for connection');
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'agri_dashboard',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    ssl: false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });
}

pool.on('connect', (client) => {
  console.log('✅ PostgreSQL client connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

// Auto-initialize database and seed on startup
async function initializeApp() {
  try {
    console.log('🚀 Starting Agricultural Dashboard API...');
    console.log('🔌 Testing database connection...');
    
    // Test connection with detailed error handling
    let connectionResult;
    try {
      connectionResult = await pool.query('SELECT NOW() as current_time, version() as pg_version');
      console.log('✅ Database connected successfully!');
      console.log('⏰ Current time:', connectionResult.rows[0].current_time);
      console.log('🐘 PostgreSQL version:', connectionResult.rows[0].pg_version.split(' ')[0]);
    } catch (connError) {
      console.error('❌ Database connection failed:');
      console.error('Error code:', connError.code);
      console.error('Error message:', connError.message);
      console.error('Error details:', {
        errno: connError.errno,
        syscall: connError.syscall,
        address: connError.address,
        port: connError.port
      });
      
      // Try to give more helpful error messages
      if (connError.code === 'ECONNREFUSED') {
        console.error('🔍 This usually means:');
        console.error('  1. DATABASE_URL is not set correctly');
        console.error('  2. Database service is not running');
        console.error('  3. Host/port is incorrect');
      } else if (connError.code === 'ENOTFOUND') {
        console.error('🔍 This usually means:');
        console.error('  1. Database hostname is incorrect');
        console.error('  2. DNS resolution failed');
      } else if (connError.code === '28P01') {
        console.error('🔍 This usually means:');
        console.error('  1. Username or password is incorrect');
      }
      
      throw connError;
    }

    // Check if database is initialized
    console.log('🔍 Checking if database schema exists...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('🏗️ Database not initialized, creating schema...');
      await initializeDatabase();
    } else {
      console.log('✅ Database schema exists');
    }

    // Check if database has data
    console.log('🔍 Checking if database has data...');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('🌱 No users found, seeding database...');
      await seedDatabase();
    } else {
      console.log(`✅ Database has ${userCount.rows[0].count} users - seeding not needed`);
    }

    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    // Log the full error for debugging
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Continue without database in production for debugging
    console.log('⚠️ Server will continue without database connection for debugging...');
    console.log('⚠️ API endpoints requiring database will fail until this is resolved');
  }
}

// Embedded initialization and seeding functions
async function initializeDatabase() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'researcher', 'policymaker')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE INDEX IF NOT EXISTS idx_crop_yields_region ON crop_yields(region);
    CREATE INDEX IF NOT EXISTS idx_crop_yields_date ON crop_yields(harvest_date);
    CREATE INDEX IF NOT EXISTS idx_crop_yields_type ON crop_yields(crop_type);
    CREATE INDEX IF NOT EXISTS idx_weather_region_date ON weather_data(region, date);
    CREATE INDEX IF NOT EXISTS idx_soil_region_date ON soil_conditions(region, date);
    CREATE INDEX IF NOT EXISTS idx_market_commodity_date ON market_prices(commodity, date);
  `;

  await pool.query(schema);
  console.log('✅ Database schema created');
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await pool.query('TRUNCATE users, crop_yields, weather_data, soil_conditions, market_prices RESTART IDENTITY CASCADE');

    // Seed users
    const users = [
      { username: 'farmer_demo', email: 'farmer@demo.com', password: 'password123', role: 'farmer' },
      { username: 'researcher_demo', email: 'researcher@demo.com', password: 'password123', role: 'researcher' },
      { username: 'policy_demo', email: 'policy@demo.com', password: 'password123', role: 'policymaker' }
    ];
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        [user.username, user.email, hashedPassword, user.role]
      );
    }
    console.log('✅ Users seeded');

    // Add some sample data (simplified for faster seeding)
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const crops = ['Rice', 'Maize', 'Wheat'];
    
    console.log('🌾 Adding sample crop yields...');
    for (let i = 0; i < 50; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const crop = crops[Math.floor(Math.random() * crops.length)];
      const yieldAmount = (Math.random() * 10 + 2).toFixed(2);
      const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      
      await pool.query(
        'INSERT INTO crop_yields (region, crop_type, yield_amount, harvest_date, area_hectares) VALUES ($1, $2, $3, $4, $5)',
        [region, crop, yieldAmount, date, (Math.random() * 50 + 10).toFixed(2)]
      );
    }
    console.log('✅ Sample crop yields seeded');

    console.log('🎉 Database seeding completed!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Initialize and start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Dashboard API: https://agric-dashboard.onrender.com/api`);
    console.log(`🏥 Health check: https://agric-dashboard.onrender.com/api/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('============================');
  });
}).catch((error) => {
  console.error('❌ Failed to initialize app:', error);
  // Start server anyway for debugging
  app.listen(PORT, () => {
    console.log(`⚠️ Server started on port ${PORT} (DATABASE ISSUE - CHECK LOGS)`);
  });
});