import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SoilChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No soil data available</div>;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p>{`Date: ${formatDate(label)}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'moisture_level' ? 'Moisture' : 
                 entry.dataKey === 'ph_level' ? 'pH Level' : entry.dataKey}: 
               ${entry.value}${entry.dataKey === 'moisture_level' ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
        />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="moisture_level" 
          stackId="1"
          stroke="#8884d8" 
          fill="#8884d8" 
          name="Moisture Level (%)"
        />
        <Area 
          type="monotone" 
          dataKey="ph_level" 
          stackId="2"
          stroke="#82ca9d" 
          fill="#82ca9d" 
          name="pH Level"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SoilChart;