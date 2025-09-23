const pool = require('../config/database');

const calculateYieldPrediction = async () => {
  try {
    // Simple prediction based on historical averages and trends
    const query = `
      SELECT 
        crop_type,
        region,
        AVG(yield_amount) as avg_yield,
        COUNT(*) as data_points,
        STDDEV(yield_amount) as std_dev
      FROM crop_yields
      WHERE harvest_date >= CURRENT_DATE - INTERVAL '2 years'
      GROUP BY crop_type, region
      HAVING COUNT(*) >= 3
    `;

    const result = await pool.query(query);
    
    const predictions = result.rows.map(row => {
      // Simple prediction: average with seasonal adjustment
      const seasonalFactor = Math.sin((new Date().getMonth() + 1) * Math.PI / 6) * 0.1 + 1;
      const predictedYield = row.avg_yield * seasonalFactor;
      
      return {
        crop_type: row.crop_type,
        region: row.region,
        predicted_yield: Math.round(predictedYield * 100) / 100,
        confidence: Math.min(row.data_points * 10, 95), // Simple confidence metric
        historical_average: Math.round(row.avg_yield * 100) / 100
      };
    });

    return predictions;
  } catch (error) {
    console.error('Prediction calculation error:', error);
    return [];
  }
};

const detectAnomalies = async () => {
  try {
    // Detect yields that are significantly different from historical averages
    const query = `
      WITH stats AS (
        SELECT 
          crop_type,
          region,
          AVG(yield_amount) as mean_yield,
          STDDEV(yield_amount) as std_yield
        FROM crop_yields
        WHERE harvest_date >= CURRENT_DATE - INTERVAL '2 years'
        GROUP BY crop_type, region
      )
      SELECT 
        cy.id,
        cy.crop_type,
        cy.region,
        cy.yield_amount,
        cy.harvest_date,
        s.mean_yield,
        s.std_yield,
        ABS(cy.yield_amount - s.mean_yield) / s.std_yield as z_score
      FROM crop_yields cy
      JOIN stats s ON cy.crop_type = s.crop_type AND cy.region = s.region
      WHERE 
        cy.harvest_date >= CURRENT_DATE - INTERVAL '6 months'
        AND s.std_yield > 0
        AND ABS(cy.yield_amount - s.mean_yield) / s.std_yield > 2
      ORDER BY z_score DESC
    `;

    const result = await pool.query(query);
    
    const anomalies = result.rows.map(row => ({
      id: row.id,
      crop_type: row.crop_type,
      region: row.region,
      yield_amount: row.yield_amount,
      harvest_date: row.harvest_date,
      expected_yield: Math.round(row.mean_yield * 100) / 100,
      anomaly_score: Math.round(row.z_score * 100) / 100,
      type: row.yield_amount > row.mean_yield ? 'high' : 'low'
    }));

    return anomalies;
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return [];
  }
};

module.exports = {
  calculateYieldPrediction,
  detectAnomalies
};