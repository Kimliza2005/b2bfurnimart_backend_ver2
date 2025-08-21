
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.createB2BUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      password,
      gender,
      address,
      city,
      state,
      zip,
      country,
      about,
      cover,
      status,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phone || !password || !gender) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Check if phone number already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already in use' });
    }

    // Hash password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with role 'b2b'
    const newUser = new User({
      firstName,
      lastName,
      phone,
      password: hashedPassword,
      gender,
      address,
      city,
      state,
      zip,
      country,
      about,
      cover,
      status,
      role: 'b2b',
    });

    await newUser.save();

    // Generate JWT token for immediate login (adjust secret and expiry as needed)
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user info and token — no OTP step here
    return res.status(201).json({
      message: 'B2B User created successfully',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        gender: newUser.gender,
        role: newUser.role,
        // any other public fields
      },
      token,
    });
  } catch (error) {
    console.error('Create B2B user error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
