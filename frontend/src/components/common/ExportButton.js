import React, { useState } from 'react';
import { dataAPI } from '../../services/api';

const ExportButton = ({ data }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (type) => {
    try {
      setExporting(true);
      
      const response = await dataAPI.exportData(type, {});
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-data-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-controls">
      <button 
        onClick={() => handleExport('crop-yields')} 
        disabled={exporting}
        className="export-btn"
      >
        Export Yields
      </button>
      <button 
        onClick={() => handleExport('weather')} 
        disabled={exporting}
        className="export-btn"
      >
        Export Weather
      </button>
      <button 
        onClick={() => handleExport('soil')} 
        disabled={exporting}
        className="export-btn"
      >
        Export Soil
      </button>
      <button 
        onClick={() => handleExport('market')} 
        disabled={exporting}
        className="export-btn"
      >
        Export Market
      </button>
    </div>
  );
};

export default ExportButton;