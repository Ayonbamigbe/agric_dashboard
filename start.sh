#!/bin/bash

# Agricultural Dashboard Quick Start Script

echo "🌾 Starting Agricultural Dashboard Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create database
echo "📊 Setting up database..."
createdb agri_dashboard 2>/dev/null || echo "Database may already exist"

# Apply schema
psql -d agri_dashboard -f database/schema.sql

# Setup backend
echo "🔧 Setting up backend..."
cd backend
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cat > .env << EOL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agri_dashboard
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key
PORT=5001
FRONTEND_URL=http://localhost:3000
EOL
    echo "📝 Created .env file. Please update with your database credentials."
fi

# Seed database
echo "🌱 Seeding database..."
npm run seed

cd ..

# Setup frontend
echo "⚛️ Setting up frontend..."
cd frontend
npm install

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Terminal 1: cd backend && npm run dev"
echo "2. Terminal 2: cd frontend && npm start"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "Demo accounts:"
echo "  Farmer: farmer@demo.com / password123"
echo "  Researcher: researcher@demo.com / password123"
echo "  Policymaker: policy@demo.com / password123"