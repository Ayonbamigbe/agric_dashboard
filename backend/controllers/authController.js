const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      console.log('⚠️ Registration: Missing fields')
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for existing username
    const userByUsername = await User.findByUsername(username);
    if (userByUsername) {
      console.log(`⛔ Registration: Username "${username}" already exists`);
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Check for existing email
    const userByEmail = await User.findByEmail(email);
    if (userByEmail) {
      console.log(`⛔ Registration: Email "${email}" already exists`);
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await User.create({ username, email, password, role });
    const token = generateToken(user);

    console.log(`✅ Registration: User "${username}" created successfully`);
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
  // Check for unique constraint violation from database
    if (error.code === '23505') {
      if (error.detail && error.detail.includes('username')) {
        console.log(`⛔ Registration: Duplicate username error from DB`);
        return res.status(409).json({ message: 'Username already exists' });
      }
      if (error.detail && error.detail.includes('email')) {
        console.log(`⛔ Registration: Duplicate email error from DB`);
        return res.status(409).json({ message: 'Email already exists' });
      }
    }
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, register };