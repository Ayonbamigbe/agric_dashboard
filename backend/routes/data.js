const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dataController = require('../controllers/dataController');
const pool = require('../config/database');

// Get crop yields
router.get('/crop-yields', auth, async (req, res) => {
  try {
    const { region, crop_type, start_date, end_date, limit = 100 } = req.query;
    
    let query = 'SELECT * FROM crop_yields';
    const params = [];
    const conditions = [];

    if (region && region !== 'all') {
      conditions.push(`region = $${params.length + 1}`);
      params.push(region);
    }

    if (crop_type) {
      conditions.push(`crop_type = $${params.length + 1}`);
      params.push(crop_type);
    }

    if (start_date) {
      conditions.push(`harvest_date >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`harvest_date <= $${params.length + 1}`);
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY harvest_date DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Crop yields fetch error:', error);
    res.status(500).json({ message: 'Error fetching crop yields' });
  }
});

// Get weather data
router.get('/weather', auth, async (req, res) => {
  try {
    const { region, start_date, end_date, limit = 100 } = req.query;
    
    let query = 'SELECT * FROM weather_data';
    const params = [];
    const conditions = [];

    if (region && region !== 'all') {
      conditions.push(`region = $${params.length + 1}`);
      params.push(region);
    }

    if (start_date) {
      conditions.push(`date >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`date <= $${params.length + 1}`);
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY date DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Weather data fetch error:', error);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

// Get soil data
router.get('/soil', auth, async (req, res) => {
  try {
    const { region, start_date, end_date, limit = 100 } = req.query;
    
    let query = 'SELECT * FROM soil_conditions';
    const params = [];
    const conditions = [];

    if (region && region !== 'all') {
      conditions.push(`region = $${params.length + 1}`);
      params.push(region);
    }

    if (start_date) {
      conditions.push(`date >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`date <= $${params.length + 1}`);
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY date DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Soil data fetch error:', error);
    res.status(500).json({ message: 'Error fetching soil data' });
  }
});

// Get market prices
router.get('/market-prices', auth, async (req, res) => {
  try {
    const { commodity, market_location, start_date, end_date, limit = 100 } = req.query;
    
    let query = 'SELECT * FROM market_prices';
    const params = [];
    const conditions = [];

    if (commodity && commodity !== 'all') {
      conditions.push(`commodity = $${params.length + 1}`);
      params.push(commodity);
    }

    if (market_location) {
      conditions.push(`market_location = $${params.length + 1}`);
      params.push(market_location);
    }

    if (start_date) {
      conditions.push(`date >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`date <= $${params.length + 1}`);
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY date DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Market prices fetch error:', error);
    res.status(500).json({ message: 'Error fetching market prices' });
  }
});

// Export data as CSV
router.get('/export/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { region, start_date, end_date } = req.query;

    let query, headers;
    const params = [];
    const conditions = [];

    switch (type) {
      case 'crop-yields':
        query = 'SELECT region, crop_type, yield_amount, harvest_date, area_hectares FROM crop_yields';
        headers = ['Region', 'Crop Type', 'Yield Amount (tons)', 'Harvest Date', 'Area (hectares)'];
        break;
      case 'weather':
        query = 'SELECT region, date, temperature, rainfall, humidity, wind_speed FROM weather_data';
        headers = ['Region', 'Date', 'Temperature (°C)', 'Rainfall (mm)', 'Humidity (%)', 'Wind Speed (km/h)'];
        break;
      case 'soil':
        query = 'SELECT region, date, moisture_level, ph_level, nitrogen_level, phosphorus_level, potassium_level FROM soil_conditions';
        headers = ['Region', 'Date', 'Moisture Level (%)', 'pH Level', 'Nitrogen Level', 'Phosphorus Level', 'Potassium Level'];
        break;
      case 'market':
        query = 'SELECT commodity, date, price, market_location FROM market_prices';
        headers = ['Commodity', 'Date', 'Price (₦)', 'Market Location'];
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    // Add filters
    if (region && region !== 'all') {
      conditions.push(`region = $${params.length + 1}`);
      params.push(region);
    }

    if (start_date) {
      const dateColumn = type === 'crop-yields' ? 'harvest_date' : 'date';
      conditions.push(`${dateColumn} >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      const dateColumn = type === 'crop-yields' ? 'harvest_date' : 'date';
      conditions.push(`${dateColumn} <= $${params.length + 1}`);
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ' + (type === 'crop-yields' ? 'harvest_date' : 'date') + ' DESC LIMIT 1000';

    const result = await pool.query(query, params);

    // Convert to CSV format
    let csvContent = headers.join(',') + '\n';
    result.rows.forEach(row => {
      const values = Object.values(row).map(value => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-export-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting data' });
  }
});

// Each route logs entry and uses controller for logic
router.post('/crop-yield', auth, dataController.uploadCropYield);
router.post('/weather', auth, dataController.uploadWeather);
router.post('/market-price', auth, dataController.uploadMarketPrice);

// // Farmer uploads crop yield
// router.post('/crop-yield', authenticate, async (req, res) => {
//   if (req.user.role !== 'farmer') return res.status(403).json({ message: 'Forbidden' });
//   const { region, crop_type, yield_amount, harvest_date } = req.body;
//   try {
//     await pool.query(
//       'INSERT INTO crop_yields (region, crop_type, yield_amount, harvest_date, farmer_id) VALUES ($1, $2, $3, $4, $5)',
//       [region, crop_type, yield_amount, harvest_date, req.user.id]
//     );
//     res.json({ message: 'Crop yield uploaded' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error uploading crop yield' });
//   }
// });

// // Researcher uploads weather data
// router.post('/weather', authenticate, async (req, res) => {
//   if (req.user.role !== 'researcher') return res.status(403).json({ message: 'Forbidden' });
//   const { region, date, temperature, rainfall, humidity, wind_speed } = req.body;
//   try {
//     await pool.query(
//       'INSERT INTO weather_data (region, date, temperature, rainfall, humidity, wind_speed) VALUES ($1, $2, $3, $4, $5, $6)',
//       [region, date, temperature, rainfall, humidity, wind_speed]
//     );
//     res.json({ message: 'Weather data uploaded' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error uploading weather data' });
//   }
// });

// // Policymaker uploads market price
// router.post('/market-price', authenticate, async (req, res) => {
//   if (req.user.role !== 'policymaker') return res.status(403).json({ message: 'Forbidden' });
//   const { commodity, date, price, market_location, unit } = req.body;
//   try {
//     await pool.query(
//       'INSERT INTO market_prices (commodity, date, price, market_location, unit) VALUES ($1, $2, $3, $4, $5)',
//       [commodity, date, price, market_location, unit]
//     );
//     res.json({ message: 'Market price uploaded' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error uploading market price' });
//   }
// });

module.exports = router;