import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { Link } from 'react-router-dom';

const UploadWeather = () => {
  const [form, setForm] = useState({ region: '', date: '', temperature: '', rainfall: '', humidity: '', wind_speed: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await authAPI.uploadWeather(form);
      setMessage('Weather data uploaded!');
    } catch (err) {
      console.error(err.message);
      console.log(err.message);
      setMessage('Upload failed');
    }
  };

  return (
    <div>
      <h4><Link to="/dashboard"> ⬅︎ Dashboard</Link></h4>
      <br></br>
      <h1>Upload Weather Data</h1>
      <form onSubmit={handleSubmit}>
        <input name="region" placeholder="Region" onChange={handleChange} required />
        <input name="date" placeholder="Date" type="date" onChange={handleChange} required />
        <input name="temperature" placeholder="Temperature" type="number" onChange={handleChange} required />
        <input name="rainfall" placeholder="Rainfall" type="number" onChange={handleChange} required />
        <input name="humidity" placeholder="Humidity" type="number" onChange={handleChange} required />
        <input name="wind_speed" placeholder="Wind Speed" type="number" onChange={handleChange} required />
        <button type="submit">Upload</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
};

export default UploadWeather;