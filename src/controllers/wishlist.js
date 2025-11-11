const Products = require('../models/Product');
const Users = require('../models/User');
const { getUser } = require('../config/getUser');

const getWishlist = async (req, res) => {
  try {
    const user = await getUser(req, res);
    //  Fetch wishlist and related products
    const wishlist = user.wishlist;
  const products = await Products.aggregate([
      {
        $match: {
          _id: { $in: wishlist }, // Match products with IDs present in the Pids array
        },
      },
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
          _variantPrices: {
            $filter: {
              input: { $map: { input: '$variants', as: 'v', in: { $ifNull: ['$$v.price', 0] } } },
              as: 'p',
              cond: { $gt: ['$$p', 0] }
            }
          },
          _variantSalePrices: {
            $filter: {
              input: { $map: { input: '$variants', as: 'v', in: { $ifNull: ['$$v.priceSale', 0] } } },
              as: 'p',
              cond: { $gt: ['$$p', 0] }
            }
          },
          firstVariant: { $arrayElemAt: ['$variants', 0] }
        },
      },
      {
        $addFields: {
          _minPrice: { $cond: [{ $gt: [{ $size: '$_variantPrices' }, 0] }, { $min: '$_variantPrices' }, 0] },
          _minPriceSale: { $cond: [{ $gt: [{ $size: '$_variantSalePrices' }, 0] }, { $min: '$_variantSalePrices' }, 0] }
        }
      },
      {
        $project: {
          image: { url: '$image.url', blurDataURL: '$image.blurDataURL' },
          name: 1,
          slug: 1,
          colors: 1,
          discount: 1,
          likes: 1,
          price: { $cond: [{ $gt: ['$_minPrice', 0] }, '$_minPrice', { $ifNull: ['$firstVariant.price', 0] }] },
          priceSale: {
            $cond: [
              { $gt: ['$_minPriceSale', 0] },
              '$_minPriceSale',
              { $cond: [{ $gt: ['$_minPrice', 0] }, '$_minPrice', { $ifNull: ['$firstVariant.priceSale', 0] }] }
            ]
          },
          // expose first variant tier prices at root for card component logic
          tierPrices: '$firstVariant.tierPrices',
          averageRating: 1,
          available: 1,
          createdAt: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const createWishlist = async (req, res) => {
  try {
    const user = await getUser(req, res);
    const uid = user._id.toString();
    const wishlist = user.wishlist;
    const { pid } = req.body;
    const isAlready = wishlist.filter((id) => id.toString() === pid);

    if (!Boolean(isAlready.length)) {
      await Users.findByIdAndUpdate(
        uid,
        { $addToSet: { wishlist: pid } }, // Add productId to the wishlist if not already present
        { new: true }
      );

      await Products.findByIdAndUpdate(pid, {
        $inc: { likes: 1 },
      });

      const newWishlist = [...wishlist, pid];

      return res.status(201).json({
        success: true,
        data: newWishlist,
        type: 'pushed',
        message: 'Added To Wishlist',
      });
    }
    await Products.findByIdAndUpdate(pid, {
      $inc: { likes: -1 },
    });

    await Users.findByIdAndUpdate(
      uid,
      { $pull: { wishlist: pid } },
      { new: true }
    );

    const removedWishlist = wishlist.filter((id) => id.toString() !== pid);

    return res.status(200).json({
      success: true,
      type: 'pulled',
      message: 'Removed From Wishlist',
      data: removedWishlist,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
module.exports = {
  getWishlist,
  createWishlist,
};
