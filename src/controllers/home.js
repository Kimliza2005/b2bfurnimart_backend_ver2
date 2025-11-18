// controllers/newsController.js
const Category = require('../models/Category');
const Product = require('../models/Product');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().select([
      'name',
      'nameI18n',
      'cover',
      'slug',
      'status',
    ]).lean();
    // Product collections should reflect admin edits immediately;
    // disable shared caching to avoid stale cards pointing to deleted slugs.
    res.set('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const getTopRatedProducts = async (req, res) => {
  try {
    const bestSellingProduct = await Product.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: 'reviews',
          foreignField: '_id',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          image: { $arrayElemAt: ['$images', 0] },
          firstVariant: { $arrayElemAt: ['$variants', 0] },
        },
      },

      {
        $sort: {
          averageRating: -1,
        },
      },
      {
        $limit: 8,
      },
      {
        $project: {
          image: { url: '$image.url', blurDataURL: '$image.blurDataURL' },
          name: 1,
          slug: 1,
          colors: 1,
          available: 1,
          discount: 1,
          likes: 1,
          priceSale: '$firstVariant.priceSale',
          price: '$firstVariant.price',
          wholesalePrice: '$firstVariant.wholesalePrice',
          tierPrices: '$firstVariant.tierPrices',
          averageRating: 1,
          
          createdAt: 1,
        },
      },
    ]);
    res.set('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({ success: true, data: bestSellingProduct });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const getBestSellerProducts = async (req, res) => {
  try {
    const bestSellingProduct = await Product.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: 'reviews',
          foreignField: '_id',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          image: { $arrayElemAt: ['$images', 0] },
          firstVariant: { $arrayElemAt: ['$variants', 0] },
        },
      },
      {
        $sort: {
          sold: -1,
        },
      },
      {
        $limit: 8,
      },
      {
        $project: {
          image: { url: '$image.url', blurDataURL: '$image.blurDataURL' },
          name: 1,
          slug: 1,
          colors: 1,
          available: 1,
          discount: 1,
          likes: 1,
          priceSale: '$firstVariant.priceSale',
          price: '$firstVariant.price',
          wholesalePrice: '$firstVariant.wholesalePrice',
          tierPrices: '$firstVariant.tierPrices',
          averageRating: 1,
          createdAt: 1,
        },
      },
    ]);
    res.set('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json({ success: true, data: bestSellingProduct });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
const getFeaturedProducts = async (req, res) => {
  try {
    const bestSellingProduct = await Product.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: 'reviews',
          foreignField: '_id',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          image: { $arrayElemAt: ['$images', 0] },
          firstVariant: { $arrayElemAt: ['$variants', 0] },
        },
      },
      {
        $match: {
          isFeatured: true,
        },
      },
      {
        $limit: 8,
      },
      {
        $project: {
          image: { url: '$image.url', blurDataURL: '$image.blurDataURL' },
          name: 1,
          slug: 1,
          colors: 1,
          available: 1,
          discount: 1,
          likes: 1,
          priceSale: '$firstVariant.priceSale',
          price: '$firstVariant.price',
          wholesalePrice: '$firstVariant.wholesalePrice',
          tierPrices: '$firstVariant.tierPrices',
          averageRating: 1,
          
          createdAt: 1,
        },
      },
    ]);
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json({ success: true, data: bestSellingProduct });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getTopRatedProducts,
  getBestSellerProducts,
  getFeaturedProducts,
};
