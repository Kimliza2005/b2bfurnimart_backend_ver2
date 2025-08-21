require('dotenv').config(); // load .env variables

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');

  // Drop the email_1 index from the users collection
  try {
    await mongoose.connection.collection('users').dropIndex('email_1');
    console.log('Dropped index: email_1');
  } catch (err) {
    console.error('Error dropping index:', err.message);
  }

  // Close the connection and exit script
  await mongoose.disconnect();
  process.exit(0);
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});
