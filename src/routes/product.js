// const express = require('express');
// const router = express.Router();
// const product = require('../controllers/product');

// // Import verifyToken function
// const verifyToken = require('../config/jwt');

// // Admin routes
// router.post('/admin/products', verifyToken, product.createProductByAdmin);
// router.get('/admin/products', verifyToken, product.getProductsByAdmin);
// router.get('/admin/products/:slug', verifyToken, product.getOneProductByAdmin);
// router.put('/admin/products/:slug', verifyToken, product.updateProductByAdmin);

// router.delete(
//   '/admin/products/:slug',
//   verifyToken,
//   product.deletedProductByAdmin
// );

// // User routes
// router.get('/products', product.getProducts);
// router.get('/products/filters', product.getFilters);
// router.get('/filters/:category', product.getFiltersByCategory);
// router.get('/filters/:category/:subcategory', product.getFiltersBySubCategory);
// router.get('/products/:slug', product.getOneProductBySlug);
// router.get('/products-slugs', product.getAllProductSlug);
// router.get('/related-products/:pid', product.relatedProducts);

// module.exports = router;
// console.log('product controller:', product);
// const express = require('express');
// const router = express.Router();
// const product = require('../controllers/product');

// // Middleware
// const attachUser = require('../middleware/auth'); // attach user info from token
// const verifyToken = require('../config/jwt'); // for admin routes

// // -------------------- Admin Routes --------------------
// router.post('/admin/products', verifyToken, product.createProductByAdmin);
// router.get('/admin/products', verifyToken, product.getProductsByAdmin);
// router.get('/admin/products/:slug', verifyToken, product.getOneProductByAdmin);
// router.put('/admin/products/:slug', verifyToken, product.updateProductByAdmin);
// router.delete('/admin/products/:slug', verifyToken, product.deletedProductByAdmin);

// // -------------------- User/Public Routes --------------------
// // attachUser ensures req.user is available for role-based pricing
// router.get('/products', attachUser, product.getProducts);
// router.get('/filters/:category', product.getFiltersByCategory);
// router.get('/filters/:category/:subcategory', product.getFiltersBySubCategory);
// router.get('/products/:slug', attachUser, product.getOneProductBySlug);
// router.get('/products-slugs', product.getAllProductSlug);
// router.get('/related-products/:pid', attachUser, product.relatedProducts);

// module.exports = router;



// const express = require("express");
// const router = express.Router();
// const product = require('../controllers/product');

// // Middleware
// const attachUser = require("../middleware/auth"); // attach user info from token
// const verifyToken = require("../config/jwt"); // for admin routes
// console.log(product); // This will show you what functions are being imported
// // -------------------- Admin Routes --------------------
// router.post("/admin/products", verifyToken, product.createProductByAdmin);
// router.get("/admin/products", verifyToken, product.getProductsByAdmin);
// router.get("/admin/products/:slug", verifyToken, product.getOneProductByAdmin);
// router.put("/admin/products/:slug", verifyToken, product.updateProductByAdmin);
// router.delete("/admin/products/:slug", verifyToken, product.deletedProductByAdmin);

// // -------------------- User/Public Routes --------------------
// // Always put static/fixed routes before dynamic ones
// router.get("/products-slugs", product.getAllProductSlug);
// router.get("/products", attachUser, product.getProducts);
// router.get("/filters/:category", product.getFiltersByCategory);
// router.get("/filters/:category/:subcategory", product.getFiltersBySubCategory);
// router.get("/related-products/:pid", attachUser, product.relatedProducts);
// router.get("/products/:slug", attachUser, product.getOneProductBySlug);

// module.exports = router;





const express = require('express');
const router = express.Router();
const product = require('../controllers/product');

const attachUser = require('../middleware/auth');   // function
const verifyToken = require('../config/jwt');       // function

// console.log('typeof attachUser:', typeof attachUser);
// console.log('typeof verifyToken:', typeof verifyToken);
// console.log('controller keys:', Object.keys(product));

// [
//   'getProducts',
//   'getFiltersByCategory',
//   'getFiltersBySubCategory',
//   'getOneProductBySlug',
//   'getAllProductSlug',
//   'relatedProducts',
//   'createProductByAdmin',
//   'getProductsByAdmin',
//   'getOneProductByAdmin',
//   'updateProductByAdmin',
//   'deletedProductByAdmin',
// ].forEach(k => console.log(`typeof product.${k}:`, typeof product[k]));

// Admin routes
router.post('/admin/products', verifyToken, product.createProductByAdmin);
router.get('/admin/products', verifyToken, product.getProductsByAdmin);
router.get('/admin/products/:slug', verifyToken, product.getOneProductByAdmin);
router.put('/admin/products/:slug', verifyToken, product.updateProductByAdmin);
router.delete('/admin/products/:slug', verifyToken, product.deletedProductByAdmin);

// Public/User routes
router.get('/products', attachUser, product.getProducts);
router.get('/filters/:category', product.getFiltersByCategory);
router.get('/filters/:category/:subcategory', product.getFiltersBySubCategory);
router.get('/products/:slug', attachUser, product.getOneProductBySlug);
router.get('/products-slugs', product.getAllProductSlug);
router.get('/related-products/:pid', attachUser, product.relatedProducts);

module.exports = router;
