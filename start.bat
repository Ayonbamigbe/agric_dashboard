@echo off
echo 🌾 Starting Agricultural Dashboard Setup...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Create database
echo 📊 Setting up database...
createdb agri_dashboard 2>nul

REM Apply schema
psql -d agri_dashboard -f database/schema.sql

REM Setup backend
echo 🔧 Setting up backend...
cd backend
npm install

REM Create .env if it doesn't exist
if not exist .env (
    echo DB_HOST=localhost > .env
    echo DB_PORT=5432 >> .env
    echo DB_NAME=agri_dashboard >> .env
    echo DB_USER=postgres >> .env
    echo DB_PASSWORD=password >> .env
    echo JWT_SECRET=your-super-secret-jwt-key >> .env
    echo PORT=5001 >> .env
    echo FRONTEND_URL=http://localhost:3000 >> .env
    echo 📝 Created .env file. Please update with your database credentials.
)

REM Seed database
echo 🌱 Seeding database...
npm run seed

cd ..

REM Setup frontend
echo ⚛️ Setting up frontend...
cd frontend
npm install

echo 🎉 Setup complete!
echo.
echo To start the application:
echo 1. Terminal 1: cd backend ^&^& npm run dev
echo 2. Terminal 2: cd frontend ^&^& npm start
echo.
echo Then visit: http://localhost:3000
echo.
echo Demo accounts:
echo   Farmer: farmer@demo.com / password123
echo   Researcher: researcher@demo.com / password123
echo   Policymaker: policy@demo.com / password123
pause