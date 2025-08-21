// test-cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dw9nwguqa',
  api_key: '899968261863269',
  api_secret: 'wl855XbzWtTs-7Z8R-sgRthu7NU',
  secure: true
});

// Try uploading a sample image
cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg')
  .then(result => {
    console.log('✅ Connected to Cloudinary. Upload successful:', result.secure_url);
  })
  .catch(error => {
    console.error('❌ Cloudinary connection failed:', error.message);
  });
