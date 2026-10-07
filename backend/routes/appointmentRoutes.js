const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getAppointments,
  createAppointment,
  updateStatus,
  addPrescription
} = require('../controllers/appointmentController');

// @route   GET /api/appointments
// @desc    Get appointments for logged-in user (patient or doctor)
router.get('/', auth, getAppointments);

// @route   POST /api/appointments
// @desc    Book a new appointment
router.post('/', auth, createAppointment);

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
router.put('/:id/status', auth, updateStatus);

// @route   POST /api/appointments/prescription
// @desc    Doctor issues a prescription
router.post('/prescription', auth, addPrescription);

module.exports = router;