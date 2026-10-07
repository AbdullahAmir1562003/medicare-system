const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { register, login } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', login);

// @route   GET /api/auth/doctors
// @desc    Get all registered doctors for appointment booking dropdown
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('_id name email');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

module.exports = router;