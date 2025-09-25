import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { Link } from 'react-router-dom'; 

const UploadMarketPrice = () => {
  const [form, setForm] = useState({ commodity: '', date: '', price: '', market_location: '', unit: 'per_ton' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await authAPI.uploadMarketPrice(form);
      setMessage('Market price uploaded!');
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
      <h1>Upload Market Price</h1>
      <form onSubmit={handleSubmit}>
        <input name="commodity" placeholder="Commodity" onChange={handleChange} required />
        <input name="date" placeholder="Date" type="date" onChange={handleChange} required />
        <input name="price" placeholder="Price" type="number" onChange={handleChange} required />
        <input name="market_location" placeholder="Market Location" onChange={handleChange} required />
        <select name="unit" value={form.unit} onChange={handleChange}>
          <option value="per_ton">per ton</option>
          <option value="per_kg">per kg</option>
        </select>
        <button type="submit">Upload</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
};

export default UploadMarketPrice;