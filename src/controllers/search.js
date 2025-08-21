
const Products = require('../models/Product');
const Categories = require('../models/Category');

const Search=async(req,res)=> {
  try {
    const { query } = await req.body;
    const categories = await Categories.find(
      {
        name: {
          $regex: query,
          $options: 'i'
        },
        status: { $ne: 'disabled' }
      },
      null,
      { limit: 10 }
    ).select(['name', 'cover', '_id', 'slug']);
    const products = await Products.find(
      {
        name: {
          $regex: query,
          $options: 'i'
        },
        status: { $ne: 'disabled' }
      },
      null,
      { limit: 10 }
    )
      .populate('category')
      .select(['name', 'priceSale', 'images', '_id', 'category', 'slug']);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = { Search };
