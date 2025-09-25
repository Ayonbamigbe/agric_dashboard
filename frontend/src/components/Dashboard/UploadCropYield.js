import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { Link } from 'react-router-dom';

const UploadCropYield = () => {
  const [form, setForm] = useState({ region: '', crop_type: '', yield_amount: '', harvest_date: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await authAPI.uploadCropYield(form);
      setMessage('Crop yield uploaded!');
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
      <h1>Upload Crop Yield</h1>
      <form onSubmit={handleSubmit}>
        <input name="region" placeholder="Region" onChange={handleChange} required />
        <input name="crop_type" placeholder="Crop Type" onChange={handleChange} required />
        <input name="yield_amount" placeholder="Yield Amount" type="number" onChange={handleChange} required />
        <input name="harvest_date" placeholder="Harvest Date" type="date" onChange={handleChange} required />
        <button type="submit">Upload</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
};

export default UploadCropYield;