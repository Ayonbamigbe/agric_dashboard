import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const MarketChart = ({ data }) => {
  const [selectedCommodity, setSelectedCommodity] = useState('all');

  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No market data available</div>;
  }

  // Get unique commodities
  const commodities = ['all', ...new Set(data.map(item => item.commodity))];

  // Filter data based on selected commodity
  const filteredData = selectedCommodity === 'all' 
    ? data 
    : data.filter(item => item.commodity === selectedCommodity);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value) => {
    return `₦${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p>{`Date: ${formatDate(label)}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`Price: ${formatCurrency(entry.value)} per ton`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Group data by commodity for multiple lines
  const commodityData = {};
  filteredData.forEach(item => {
    if (!commodityData[item.commodity]) {
      commodityData[item.commodity] = [];
    }
    commodityData[item.commodity].push(item);
  });

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d084d0'];

  return (
    <div className="market-chart-container">
      <div className="chart-controls">
        <label>Commodity: </label>
        <select 
          value={selectedCommodity}
          onChange={(e) => setSelectedCommodity(e.target.value)}
        >
          {commodities.map(commodity => (
            <option key={commodity} value={commodity}>
              {commodity === 'all' ? 'All Commodities' : commodity}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            type="category"
            allowDuplicatedCategory={false}
          />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {Object.entries(commodityData).map(([commodity, commodityItems], index) => (
            <Line
              key={commodity}
              data={commodityItems}
              type="monotone"
              dataKey="price"
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              name={commodity}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketChart;