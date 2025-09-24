// const app = require('./app');
// require('dotenv').config();

// const PORT = process.env.PORT || 5001;

// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
//   console.log(`📊 Dashboard API: http://localhost:${PORT}/api`);
//   console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
// });

const app = require('./app');
const pool = require('./config/database');
const { initializeDatabase } = require('./initDatabase');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

// Auto-initialize database and seed on startup
async function initializeApp() {
  try {
    console.log('🚀 Starting Agricultural Dashboard API...');
    
    // Wait for database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Check if database is initialized
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

    // Check if database has data (check users table)
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('🌱 No users found, seeding database...');
      await seedDatabase();
    } else {
      console.log(`✅ Database has ${userCount.rows[0].count} users - seeding not needed`);
    }

    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't exit - let the server start anyway for debugging
  }
}

// Embedded seeding function
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

    // Seed crop yields
    await seedCropYields();
    console.log('✅ Crop yields seeded');

    // Seed weather data
    await seedWeatherData();
    console.log('✅ Weather data seeded');

    // Seed soil conditions
    await seedSoilConditions();
    console.log('✅ Soil conditions seeded');

    // Seed market prices
    await seedMarketPrices();
    console.log('✅ Market prices seeded');

    console.log('🎉 Database seeding completed!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function seedCropYields() {
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const crops = ['Rice', 'Maize', 'Wheat', 'Cassava', 'Yam', 'Beans'];
  
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 30)) {
    for (const region of regions) {
      for (const crop of crops) {
        // Skip some entries randomly for realistic data
        if (Math.random() < 0.3) continue;

        const baseYield = {
          'Rice': 4.5,
          'Maize': 3.2,
          'Wheat': 2.8,
          'Cassava': 15.5,
          'Yam': 12.3,
          'Beans': 1.8
        }[crop];

        // Add seasonal and regional variations
        const seasonalFactor = 0.8 + 0.4 * Math.sin((d.getMonth() + 1) * Math.PI / 6);
        const regionalFactor = Math.random() * 0.4 + 0.8;
        const randomVariation = Math.random() * 0.3 + 0.85;
        
        const yieldAmount = baseYield * seasonalFactor * regionalFactor * randomVariation;
        const areaHectares = Math.random() * 50 + 10;

        await pool.query(
          'INSERT INTO crop_yields (region, crop_type, yield_amount, harvest_date, area_hectares) VALUES ($1, $2, $3, $4, $5)',
          [region, crop, yieldAmount.toFixed(2), new Date(d), areaHectares.toFixed(2)]
        );
      }
    }
  }
}

async function seedWeatherData() {
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    for (const region of regions) {
      if (Math.random() < 0.1) continue;

      const baseTemp = {
        'North': 32, 'South': 28, 'East': 26, 'West': 29, 'Central': 30
      }[region];

      const seasonalTemp = 5 * Math.sin((d.getMonth() + 1) * Math.PI / 6);
      const temperature = baseTemp + seasonalTemp + (Math.random() * 6 - 3);

      const isRainySeason = d.getMonth() >= 5 && d.getMonth() <= 9;
      const rainfallBase = isRainySeason ? 15 : 2;
      const rainfall = Math.random() < 0.3 ? 0 : Math.random() * rainfallBase;

      const humidity = 40 + Math.random() * 40 + (isRainySeason ? 20 : 0);
      const windSpeed = Math.random() * 15 + 5;

      await pool.query(
        'INSERT INTO weather_data (region, date, temperature, rainfall, humidity, wind_speed) VALUES ($1, $2, $3, $4, $5, $6)',
        [region, new Date(d), temperature.toFixed(1), rainfall.toFixed(1), humidity.toFixed(1), windSpeed.toFixed(1)]
      );
    }
  }
}

async function seedSoilConditions() {
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
    for (const region of regions) {
      if (Math.random() < 0.2) continue;

      const moistureLevel = Math.random() * 40 + 30;
      const phLevel = Math.random() * 2 + 6;
      const nitrogenLevel = Math.random() * 30 + 20;
      const phosphorusLevel = Math.random() * 25 + 15;
      const potassiumLevel = Math.random() * 35 + 25;
      const organicMatter = Math.random() * 5 + 2;

      await pool.query(
        'INSERT INTO soil_conditions (region, date, moisture_level, ph_level, nitrogen_level, phosphorus_level, potassium_level, organic_matter) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [region, new Date(d), moistureLevel.toFixed(1), phLevel.toFixed(1), nitrogenLevel.toFixed(1), phosphorusLevel.toFixed(1), potassiumLevel.toFixed(1), organicMatter.toFixed(1)]
      );
    }
  }
}

async function seedMarketPrices() {
  const commodities = ['Rice', 'Maize', 'Wheat', 'Cassava', 'Yam', 'Beans'];
  const markets = ['Lagos', 'Kano', 'Port Harcourt', 'Abuja', 'Ibadan'];
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    for (const commodity of commodities) {
      for (const market of markets) {
        if (Math.random() < 0.4) continue;

        const basePrice = {
          'Rice': 450000, 'Maize': 280000, 'Wheat': 320000, 
          'Cassava': 120000, 'Yam': 200000, 'Beans': 380000
        }[commodity];

        const marketFactor = Math.random() * 0.3 + 0.85;
        const seasonalFactor = 0.9 + 0.2 * Math.sin((d.getMonth() + 1) * Math.PI / 3);
        const dailyVariation = Math.random() * 0.1 + 0.95;
        const price = basePrice * marketFactor * seasonalFactor * dailyVariation;

        await pool.query(
          'INSERT INTO market_prices (commodity, date, price, market_location) VALUES ($1, $2, $3, $4) ON CONFLICT (commodity, date, market_location) DO NOTHING',
          [commodity, new Date(d), Math.round(price), market]
        );
      }
    }
  }
}

// Initialize database and start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Dashboard API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((error) => {
  console.error('❌ Failed to initialize app:', error);
  process.exit(1);
});