'use strict';
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// app.use(cors());
app.use(cors({
  origin: ['https://www.b2bfurnimart.com', 'http://localhost:3000'], // Allow requests from these origins
  credentials: true, // Allow credentials for cookies, authorization headers, or TLS client certificates
}));

app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false // <-- this stops Mongoose from recreating old indexes
  })
  .then(() => {
    console.log('Connected to MongoDB');
    // Ensure "orderIndex" on categories is not unique. Drop legacy unique index if present.
    try {
      const col = mongoose.connection.collection('categories');
      col.indexes().then((idx) => {
        const legacy = idx.find((i) => i.key && i.key.orderIndex === 1 && i.unique);
        if (legacy && legacy.name) {
          col.dropIndex(legacy.name)
            .then(() => console.log('Dropped legacy unique index on categories.orderIndex'))
            .catch(() => {});
        }
      }).catch(() => {});
    } catch (_) {}
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Routes

const homeRoutes = require('./routes/home');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const subcategoryRoutes = require('./routes/subcategory');
const newsletterRoutes = require('./routes/newsletter');
const productRoutes = require('./routes/product');
const dashboardRoutes = require('./routes/dashboard');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const couponCodeRoutes = require('./routes/coupon-code');
const reviewRoutes = require('./routes/review');
const wishlistRoutes = require('./routes/wishlist');
const OrderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment-intents');
const delete_fileRoutes = require('./routes/file-delete');
const adminRoutes = require('./routes/admin'); 
const testRoutes = require("./routes/test");
const b2bUsersRoutes = require('./routes/b2bUsers');
// const attachUser = require('./middleware/auth'); // <-- added



// app.use(attachUser);


app.use('/api', homeRoutes);
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', subcategoryRoutes);
app.use('/api', newsletterRoutes);
app.use('/api', productRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', searchRoutes);
app.use('/api', userRoutes);
app.use('/api', cartRoutes);
app.use('/api', couponCodeRoutes);
app.use('/api', reviewRoutes);
app.use('/api', wishlistRoutes);
app.use('/api', OrderRoutes);
app.use('/api', paymentRoutes);
app.use('/api', delete_fileRoutes);



app.use('/api/admin', adminRoutes);
// GET API
app.get('/', (req, res) => {
  res.send('This is a GET API');
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// const User = require('./models/User');
// const { createB2BUser } = require('./controllers/b2bUserController');

// app.get('/api/test-users', async (req, res) => {
//   const users = await User.find();
//   res.json(users);
// });

//Test server
app.get("/api/test-server", async (req, res) => {
  const start = Date.now();

  const end = Date.now();
  console.log("⏱ Server response time:", end - start, "ms");

  res.json({
    message: "Server is alive",
    responseTime: end - start
  });
});
