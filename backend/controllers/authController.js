const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: (role || 'patient').toLowerCase()
    });

    await user.save();

    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase()
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretKey', { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: payload
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase()
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretKey', { expiresIn: '7d' });

    res.json({
      token,
      user: payload
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};