const mongoose = require('mongoose');
require('dotenv').config(); 

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adminworld:adminWORLD@db1.nr69ih9.mongodb.net/db1';

async function checkIndexes() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const indexes = await mongoose.connection.collection('users').indexes();
    console.log('\n Indexes on "users" collection:\n');
    console.log(indexes);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkIndexes();
