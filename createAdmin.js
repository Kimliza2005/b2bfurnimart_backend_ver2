require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User'); // adjust the path if needed

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const userData = {
      firstName: 'Admin',
      lastName: '1',
      password: 'StrongPassword123!', // Ensure this meets your password policy
      gender: 'female',           
      phone: '0719778888',
      otp: '0000',                
      role: 'admin',     
      isVerified: true,
    };

    const admin = new User(userData);
    await admin.save();

    console.log('user created successfully:', admin);
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
