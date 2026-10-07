const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// Get appointments for the logged-in user
exports.getAppointments = async (req, res) => {
  try {
    // Extract ID regardless of how the JWT payload structured it
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    const role = (req.user?.role || '').toLowerCase();

    if (!userId) {
      return res.status(200).json([]);
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(userId);
    const objId = isObjectId ? new mongoose.Types.ObjectId(userId) : userId;

    let query = {};

    if (role === 'doctor') {
      query = {
        $or: [
          { doctor: objId },
          { doctor: userId.toString() },
          { doctorId: objId },
          { doctorId: userId.toString() }
        ]
      };
    } else if (role === 'patient') {
      query = {
        $or: [
          { patient: objId },
          { patient: userId.toString() },
          { patientId: objId },
          { patientId: userId.toString() }
        ]
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email role')
      .populate('doctor', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('getAppointments error:', error);
    return res.status(200).json([]); // Always return array to prevent frontend hang
  }
};

// Book appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, symptoms } = req.body;
    const patientId = req.user?.id || req.user?._id || req.user?.userId;

    const newApt = new Appointment({
      patient: new mongoose.Types.ObjectId(patientId),
      doctor: new mongoose.Types.ObjectId(doctorId),
      date,
      timeSlot: timeSlot || '09:00 AM - 10:00 AM',
      symptoms: symptoms || 'General Consultation',
      status: 'pending'
    });

    const saved = await newApt.save();
    return res.status(201).json(saved);
  } catch (error) {
    console.error('createAppointment error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Add prescription
exports.addPrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, medicines, instructions } = req.body;
    const doctorId = req.user?.id || req.user?._id || req.user?.userId;

    const prescription = new Prescription({
      appointment: appointmentId,
      doctor: doctorId,
      patient: patientId,
      medicines,
      instructions
    });

    await prescription.save();
    await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
    return res.status(201).json(prescription);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};