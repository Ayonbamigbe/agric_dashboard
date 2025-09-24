import React, { useState, useEffect } from 'react';
import { dashboardAPI, dataAPI } from '../../services/api';
import YieldChart from '../Charts/YieldChart';
import WeatherChart from '../Charts/WeatherChart';
import SoilChart from '../Charts/SoilChart';
import MarketChart from '../Charts/MarketChart';
import HarvestMap from '../Maps/HarvestMap';
import ExportButton from '../common/ExportButton';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState({
    yields: [],
    weather: [],
    soil: [],
    market: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadDashboardData();
    loadChartData();
  }, [selectedRegion]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const loadDashboardData = async () => {
    try {
      const response = await dashboardAPI.getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    }
  };

  const loadChartData = async () => {
    try {
      setLoading(true);
      const filters = selectedRegion !== 'all' ? { region: selectedRegion } : {};

      const [yieldsRes, weatherRes, soilRes, marketRes] = await Promise.all([
        dataAPI.getCropYields(filters),
        dataAPI.getWeatherData(filters),
        dataAPI.getSoilData(filters),
        dataAPI.getMarketPrices(filters)
      ]);

      setChartData({
        yields: yieldsRes.data,
        weather: weatherRes.data,
        soil: soilRes.data,
        market: marketRes.data
      });
    } catch (error) {
      setError('Failed to load chart data');
      console.error('Chart data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const regions = ['all', 'North', 'South', 'East', 'West', 'Central'];

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Agricultural Harvest Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.username} ({user.role})</span> 
        </div>
        <span className="user-info">
            <div>{/* ...dashboard UI... */}
              <button onClick={handleLogout}>Logout</button>
            </div> 
          </span>
      </div>
      

      <div className="controls">
        <div className="region-selector">
          <label>Region: </label>
          <select 
            value={selectedRegion} 
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regions.map(region => (
              <option key={region} value={region}>
                {region === 'all' ? 'All Regions' : region}
              </option>
            ))}
          </select>
        </div>
        <ExportButton data={chartData} />
      </div>

      {dashboardData && (
        <div className="summary-cards">
          <div className="card">
            <h3>Total Regions</h3>
            <p className="stat">{dashboardData.summary.total_regions}</p>
          </div>
          <div className="card">
            <h3>Crop Types</h3>
            <p className="stat">{dashboardData.summary.total_crops}</p>
          </div>
          <div className="card">
            <h3>Average Yield</h3>
            <p className="stat">{parseFloat(dashboardData.summary.avg_yield).toFixed(2)} tons</p>
          </div>
          <div className="card">
            <h3>Total Yield</h3>
            <p className="stat">{parseFloat(dashboardData.summary.total_yield).toFixed(2)} tons</p>
          </div>
        </div>
      )}

      <div className="charts-container">
        <div className="chart-section">
          <h3>Crop Yield Trends</h3>
          <YieldChart data={chartData.yields} />
        </div>

        <div className="chart-section">
          <h3>Weather Patterns</h3>
          <WeatherChart data={chartData.weather} />
        </div>

        <div className="chart-section">
          <h3>Soil Conditions</h3>
          <SoilChart data={chartData.soil} />
        </div>

        <div className="chart-section">
          <h3>Market Prices</h3>
          <MarketChart data={chartData.market} />
        </div>

        <div className="chart-section">
          <h3>Regional Harvest Map</h3>
          <HarvestMap data={chartData.yields} />
        </div>
      </div>

      {dashboardData?.predictions && dashboardData.predictions.length > 0 && (
        <div className="predictions-section">
          <h3>Yield Predictions</h3>
          <div className="predictions-grid">
            {dashboardData.predictions.slice(0, 6).map((prediction, index) => (
              <div key={index} className="prediction-card">
                <h4>{prediction.crop_type} - {prediction.region}</h4>
                <p><strong>Predicted:</strong> {prediction.predicted_yield} tons</p>
                <p><strong>Historical:</strong> {prediction.historical_average} tons</p>
                <p><strong>Confidence:</strong> {prediction.confidence}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboardData?.anomalies && dashboardData.anomalies.length > 0 && (
        <div className="anomalies-section">
          <h3>Yield Anomalies</h3>
          <div className="anomalies-list">
            {dashboardData.anomalies.slice(0, 5).map((anomaly, index) => (
              <div key={index} className={`anomaly-item ${anomaly.type}`}>
                <span className="anomaly-crop">{anomaly.crop_type} - {anomaly.region}</span>
                <span className="anomaly-yield">
                  Actual: {anomaly.yield_amount} tons 
                  (Expected: {anomaly.expected_yield} tons)
                </span>
                <span className="anomaly-score">Score: {anomaly.anomaly_score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;