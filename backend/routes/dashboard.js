const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/database');
const { calculateYieldPrediction, detectAnomalies } = require('../utils/analytics');

const getDashboardData = async (req, res) => {
  try {
    const { role } = req.user;

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT region) as total_regions,
        COUNT(DISTINCT crop_type) as total_crops,
        AVG(yield_amount) as avg_yield,
        SUM(yield_amount) as total_yield
      FROM crop_yields
      WHERE harvest_date >= CURRENT_DATE - INTERVAL '1 year'
    `;

    const recentWeatherQuery = `
      SELECT * FROM weather_data
      ORDER BY date DESC
      LIMIT 7
    `;

    const marketTrendsQuery = `
      SELECT * FROM market_prices
      ORDER BY date DESC
      LIMIT 30
    `;

    const soilDataQuery = `
      SELECT * FROM soil_conditions
      ORDER BY date DESC
      LIMIT 10
    `;

    const [summaryResult, weatherResult, marketResult, soilResult] = await Promise.all([
      pool.query(summaryQuery),
      pool.query(recentWeatherQuery),
      pool.query(marketTrendsQuery),
      pool.query(soilDataQuery)
    ]);

    // Get yield predictions
    const predictions = await calculateYieldPrediction();
    
    // Detect anomalies
    const anomalies = await detectAnomalies();

    const dashboardData = {
      summary: summaryResult.rows[0],
      recentWeather: weatherResult.rows,
      marketTrends: marketResult.rows,
      soilData: soilResult.rows,
      predictions,
      anomalies,
      userRole: role
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

const getRegionalData = async (req, res) => {
  try {
    const { region } = req.params;

    const query = `
      SELECT 
        cy.region,
        cy.crop_type,
        cy.yield_amount,
        cy.harvest_date,
        w.temperature,
        w.rainfall,
        s.moisture_level,
        s.ph_level,
        m.price
      FROM crop_yields cy
      LEFT JOIN weather_data w ON cy.region = w.region AND DATE(cy.harvest_date) = DATE(w.date)
      LEFT JOIN soil_conditions s ON cy.region = s.region AND DATE(cy.harvest_date) = DATE(s.date)
      LEFT JOIN market_prices m ON cy.crop_type = m.commodity AND DATE(cy.harvest_date) = DATE(m.date)
      WHERE cy.region = $1
      ORDER BY cy.harvest_date DESC
      LIMIT 100
    `;

    const result = await pool.query(query, [region]);
    res.json(result.rows);
  } catch (error) {
    console.error('Regional data error:', error);
    res.status(500).json({ message: 'Error fetching regional data' });
  }
};

router.get('/', auth, getDashboardData);
router.get('/region/:region', auth, getRegionalData);

module.exports = router;