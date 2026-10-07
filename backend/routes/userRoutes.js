const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('_id name email role');
    return res.status(200).json(doctors);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

module.exports = router;