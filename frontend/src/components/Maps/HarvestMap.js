import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HarvestMap = ({ data }) => {
  // Mock coordinates for regions (in real app, you'd have a regions database)
  const regionCoordinates = {
    'North': [9.0820, 8.6753],
    'South': [6.2084, 6.9915], 
    'East': [6.5244, 7.5086],
    'West': [7.3775, 3.9470],
    'Central': [7.3986, 8.9131]
  };

  const center = [7.3986, 8.9131]; // Center of Nigeria

  if (!data || data.length === 0) {
    return (
      <div className="map-container">
        <p>No regional data available for mapping</p>
      </div>
    );
  }

  // Aggregate data by region
  const regionData = data.reduce((acc, item) => {
    if (!acc[item.region]) {
      acc[item.region] = {
        region: item.region,
        totalYield: 0,
        count: 0,
        crops: new Set()
      };
    }
    acc[item.region].totalYield += item.yield_amount || 0;
    acc[item.region].count++;
    acc[item.region].crops.add(item.crop_type);
    return acc;
  }, {});

  return (
    <div className="map-container" style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {Object.values(regionData).map((region) => {
          const coordinates = regionCoordinates[region.region];
          if (!coordinates) return null;

          const avgYield = region.totalYield / region.count;
          const radius = Math.max(10, Math.min(50, avgYield / 10));

          return (
            <CircleMarker
              key={region.region}
              center={coordinates}
              radius={radius}
              fillOpacity={0.6}
              color="#2563eb"
              fillColor="#3b82f6"
            >
              <Popup>
                <div>
                  <h4>{region.region} Region</h4>
                  <p><strong>Average Yield:</strong> {avgYield.toFixed(2)} tons</p>
                  <p><strong>Total Records:</strong> {region.count}</p>
                  <p><strong>Crops:</strong> {Array.from(region.crops).join(', ')}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HarvestMap;