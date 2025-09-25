import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import UploadCropYield from './components/Dashboard/UploadCropYield';
import UploadWeather from './components/Dashboard/UploadWeather';
import UploadMarketPrice from './components/Dashboard/UploadMarketPrice';
import './App.css';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        alert('Logged out due to inactivity');
      }, 900000); // 15 minutes
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [navigate]);
  return (
    // <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/upload-crop-yield" element={
            <ProtectedRoute>
              <UploadCropYield />
            </ProtectedRoute>
          } />
          <Route path="/upload-weather" element={
            <ProtectedRoute>
              <UploadWeather />
            </ProtectedRoute>
          } />
          <Route path="/upload-market-price" element={
            <ProtectedRoute>
              <UploadMarketPrice />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    // </Router>
  );
}

export default App;