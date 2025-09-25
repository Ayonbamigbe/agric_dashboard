const pool = require('../config/database');

// Helper to log and send errors
function handleError(res, error, context) {
  console.error(`❌ [${context}] Error:`, error);
  res.status(500).json({ message: `Server error in ${context}` });
}

// Farmer: Upload Crop Yield
exports.uploadCropYield = async (req, res) => {
  console.log('➡️ [uploadCropYield] Request received:', req.body);
  if (req.user.role !== 'farmer') {
    console.log('⛔ [uploadCropYield] Forbidden: Not a farmer');
    return res.status(403).json({ message: 'Forbidden: Only farmers can upload crop yield' });
  }
  const { region, crop_type, yield_amount, harvest_date } = req.body;
  if (!region || !crop_type || !yield_amount || !harvest_date) {
    console.log('⚠️ [uploadCropYield] Missing fields');
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO crop_yields (region, crop_type, yield_amount, harvest_date, farmer_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [region, crop_type, yield_amount, harvest_date, req.user.id]
    );
    console.log('✅ [uploadCropYield] Success:', result.rows[0]);
    res.json({ message: 'Crop yield uploaded', id: result.rows[0].id });
  } catch (error) {
    handleError(res, error, 'uploadCropYield');
  }
};

// Researcher: Upload Weather Data
exports.uploadWeather = async (req, res) => {
  console.log('➡️ [uploadWeather] Request received:', req.body);
  if (req.user.role !== 'researcher') {
    console.log('⛔ [uploadWeather] Forbidden: Not a researcher');
    return res.status(403).json({ message: 'Forbidden: Only researchers can upload weather data' });
  }
  const { region, date, temperature, rainfall, humidity, wind_speed } = req.body;
  if (!region || !date || !temperature || !rainfall || !humidity || !wind_speed) {
    console.log('⚠️ [uploadWeather] Missing fields');
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO weather_data (region, date, temperature, rainfall, humidity, wind_speed, researcher_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [region, date, temperature, rainfall, humidity, wind_speed, req.user.id]
    );
    console.log('✅ [uploadWeather] Success:', result.rows[0]);
    res.json({ message: 'Weather data uploaded', id: result.rows[0].id });
  } catch (error) {
    handleError(res, error, 'uploadWeather');
  }
};

// Policymaker: Upload Market Price
exports.uploadMarketPrice = async (req, res) => {
  console.log('➡️ [uploadMarketPrice] Request received:', req.body);
  if (req.user.role !== 'policymaker') {
    console.log('⛔ [uploadMarketPrice] Forbidden: Not a policymaker');
    return res.status(403).json({ message: 'Forbidden: Only policymakers can upload market price' });
  }
  const { commodity, date, price, market_location, unit } = req.body;
  if (!commodity || !date || !price || !market_location || !unit) {
    console.log('⚠️ [uploadMarketPrice] Missing fields');
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO market_prices (commodity, date, price, market_location, unit, policymaker_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [commodity, date, price, market_location, unit, req.user.id]
    );
    console.log('✅ [uploadMarketPrice] Success:', result.rows[0]);
    res.json({ message: 'Market price uploaded', id: result.rows[0].id });
  } catch (error) {
    handleError(res, error, 'uploadMarketPrice');
  }
};