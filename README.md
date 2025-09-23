# Agricultural Harvest Data Analytics Dashboard

A full-stack web application for visualizing agricultural data including crop yields, weather patterns, soil conditions, and market prices to support food security initiatives.

## 🌾 Features

- **Interactive Dashboard**: Real-time visualization of agricultural data
- **Multi-Role Support**: Different views for Farmers, Researchers, and Policymakers  
- **Data Analytics**: Yield predictions and anomaly detection
- **Regional Mapping**: Geographic visualization using Leaflet.js
- **Data Export**: CSV export functionality for all data types
- **Responsive Design**: Mobile-friendly interface
- **Secure Authentication**: JWT-based user authentication

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Recharts for data visualization
- Leaflet.js for mapping
- Axios for API calls
- React Router for navigation

**Backend:**
- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcryptjs for password hashing
- CSV export functionality

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd agri-dashboard
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb agri_dashboard

# Run the database schema
psql -d agri_dashboard -f database/schema.sql
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your database credentials

# Seed the database with sample data
npm run seed

# Start backend server
npm run dev
```

The backend will be running on `http://localhost:5001`

### 4. Frontend Setup
```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm start
```

The frontend will be running on `http://localhost:3000`

## 📊 Demo Accounts

Use these accounts to test different user roles:

| Role | Email | Password |
|------|-------|----------|
| Farmer | farmer@demo.com | password123 |
| Researcher | researcher@demo.com | password123 |
| Policymaker | policy@demo.com | password123 |

## 🗂️ Project Structure

```
agri-dashboard/
├── backend/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── app.js             # Express app setup
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static files
├── database/              # Database schema
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/dashboard/region/:region` - Get regional data

### Data
- `GET /api/data/crop-yields` - Get crop yield data
- `GET /api/data/weather` - Get weather data
- `GET /api/data/soil` - Get soil condition data
- `GET /api/data/market-prices` - Get market price data
- `GET /api/data/export/:type` - Export data as CSV

## 📈 Features Detail

### Dashboard Views
- **Summary Cards**: Key statistics and metrics
- **Yield Charts**: Line and bar charts for crop yield trends
- **Weather Visualization**: Temperature, rainfall, and humidity data
- **Soil Analysis**: Moisture, pH, and nutrient levels
- **Market Prices**: Price trends for different commodities
- **Regional Map**: Geographic visualization of harvest data

### Analytics
- **Yield Prediction**: Simple forecasting based on historical averages
- **Anomaly Detection**: Identifies unusual yield patterns
- **Trend Analysis**: Historical data visualization
- **Regional Comparisons**: Cross-regional data analysis

### Data Export
- Export crop yields, weather, soil, and market data as CSV
- Filtered exports based on date ranges and regions
- Ready for further analysis in Excel or other tools

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# The build files will be in the `build` folder
```

### Environment Variables

**Backend (.env)**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agri_dashboard
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=5001
FRONTEND_URL=http://localhost:3000
```

## 📊 Sample Data

The application comes with comprehensive sample data including:
- **2 years** of crop yield data across 5 regions
- **Daily weather data** for multiple regions
- **Soil condition monitoring** data
- **Market price trends** for 6 different commodities
- **User accounts** for all three roles

## 🚀 Quick Start

Use the automated setup script:

### Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

### Windows:
```batch
start.bat
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Todo / Future Enhancements

- [ ] Advanced ML models for yield prediction
- [ ] Real-time data integration from IoT sensors
- [ ] Mobile app development
- [ ] Advanced user management and permissions
- [ ] Data visualization improvements
- [ ] Integration with satellite imagery APIs
- [ ] Automated report generation
- [ ] Multi-language support

## ⚠️ Known Issues

- Map markers may not display perfectly on all zoom levels
- Large dataset exports may take time to process
- Some charts may not render properly on very small screens

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in .env file
- Verify database exists and schema is applied

### Frontend Not Loading
- Check if backend server is running on port 5001
- Verify API URL in frontend environment variables
- Clear browser cache and restart development server

### Authentication Issues
- Check JWT_SECRET is set in backend .env
- Verify token expiration settings
- Ensure user exists in database

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@agridashboard.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Nigerian Agricultural Research Institutes for domain expertise
- OpenStreetMap for mapping services
- Recharts library for excellent charting components
- React and Node.js communities for robust frameworks

---

**Built with ❤️ for sustainable agriculture and food security**