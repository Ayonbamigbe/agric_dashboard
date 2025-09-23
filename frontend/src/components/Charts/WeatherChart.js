import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const WeatherChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No weather data available</div>;
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
              {`${entry.dataKey === 'temperature' ? 'Temperature' : 
                 entry.dataKey === 'rainfall' ? 'Rainfall' : 
                 entry.dataKey === 'humidity' ? 'Humidity' : entry.dataKey}: 
               ${entry.value}${entry.dataKey === 'temperature' ? '°C' : 
                              entry.dataKey === 'rainfall' ? 'mm' : 
                              entry.dataKey === 'humidity' ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
        />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar yAxisId="left" dataKey="rainfall" fill="#4a90e2" name="Rainfall (mm)" />
        <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#e74c3c" strokeWidth={2} name="Temperature (°C)" />
        <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#2ecc71" strokeWidth={2} name="Humidity (%)" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default WeatherChart;