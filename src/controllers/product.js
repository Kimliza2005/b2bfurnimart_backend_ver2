// const Product = require("../models/Product");
// const Category = require("../models/Category");
// const SubCategory = require("../models/SubCategory");
// const _ = require("lodash");
// const { multiFilesDelete } = require("../config/uploader");
// const blurDataUrl = require("../config/getBlurDataURL");
// const { getAdmin } = require("../config/getUser");

// // -------------------- Role-based pricing --------------------
// const applyRolePricing = (item, role) => {
//   if (!item) return item;
//   const isB2B = role === "b2b";
//   const p = item.toObject ? item.toObject() : { ...item };
//   if (isB2B) {
//     p.price =
//       typeof p.wholesalePrice === "number" && p.wholesalePrice > 0
//         ? p.wholesalePrice
//         : p.price;
//   } else {
//     delete p.wholesalePrice;
//     delete p.tierPrices;
//   }
//   return p;
// };

// const withRolePricing = (arr, role) =>
//   Array.isArray(arr) ? arr.map((x) => applyRolePricing(x, role)) : arr;

// // -------------------- Controllers --------------------

// // GET all products for users
// // const getProducts = async (req, res) => {
// //   try {
// //     const query = req.query;
// //     let newQuery = { ...query };
// //     ['page', 'prices', 'sizes', 'colors', 'name', 'date', 'price', 'top', 'category', 'subCategory'].forEach(k => delete newQuery[k]);

// //     // parse filters
// //     for (const [key, value] of Object.entries(newQuery)) {
// //       newQuery = { ...newQuery, [key]: value.split('_') };
// //     }

// //     const category = query.category ? await Category.findOne({ slug: query.category }).select('slug') : null;
// //     const subCategory = query.subCategory ? await SubCategory.findOne({ slug: query.subCategory }).select('slug') : null;
// //     const skip = query.limit || 12;

// //     const totalProducts = await Product.countDocuments({
// //       ...newQuery,
// //       ...(category && { category: category._id }),
// //       ...(subCategory && { subCategory: subCategory._id }),
// //       ...(query.sizes && { sizes: { $in: query.sizes.split('_') } }),
// //       ...(query.colors && { colors: { $in: query.colors.split('_') } }),
// //       priceSale: {
// //         $gt: query.prices ? Number(query.prices.split('_')[0]) : 1,
// //         $lt: query.prices ? Number(query.prices.split('_')[1]) : 1000000,
// //       },
// //       status: { $ne: 'disabled' },
// //     });

// //     const minPrice = query.prices ? Number(query.prices.split('_')[0]) : 1;
// //     const maxPrice = query.prices ? Number(query.prices.split('_')[1]) : 10000000;

// //     const products = await Product.aggregate([
// //       { $lookup: { from: 'reviews', localField: 'reviews', foreignField: '_id', as: 'reviews' } },
// //       { $addFields: { averageRating: { $avg: '$reviews.rating' }, image: { $arrayElemAt: ['$images', 0] } } },
// //       { $match: {
// //           ...(category && { category: category._id }),
// //           ...(subCategory && { subCategory: subCategory._id }),
// //           ...(query.isFeatured && { isFeatured: Boolean(query.isFeatured) }),
// //           ...(query.sizes && { sizes: { $in: query.sizes.split('_') } }),
// //           ...(query.colors && { colors: { $in: query.colors.split('_') } }),
// //           ...(query.prices && { priceSale: { $gt: minPrice, $lt: maxPrice } }),
// //           status: { $ne: 'disabled' },
// //       }},
// //       { $project: {
// //           image: { url: '$image.url', blurDataURL: '$image.blurDataURL' },
// //           name: 1, slug: 1, colors: 1, discount: 1, likes: 1,
// //           priceSale: 1, price: 1, averageRating: 1, available: 1,
// //           createdAt: 1, wholesalePrice: 1, tierPrices: 1, weight: 1,
// //       }},
// //       { $sort: {
// //           ...((query.date && { createdAt: Number(query.date) }) ||
// //             (query.price && { priceSale: Number(query.price) }) ||
// //             (query.name && { name: Number(query.name) }) ||
// //             (query.top && { averageRating: Number(query.top) }) || { averageRating: -1 }),
// //       }},
// //       { $skip: Number(skip * ((query.page ? parseInt(query.page[0]) : 1) - 1)) },
// //       { $limit: Number(skip) },
// //     ]);

// //     res.status(200).json({
// //       success: true,
// //       data: withRolePricing(products, req.user?.role),
// //       total: totalProducts,
// //       count: Math.ceil(totalProducts / skip),
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message, error });
// //   }
// // };

// // // GET filters for users
// // const getFilters = async (req, res) => {
// //   try {
// //     const totalProducts = await Product.find({ status: { $ne: 'disabled' } }).select(['colors', 'sizes', 'price']);
// //     const colors = _.union(...totalProducts.map(v => v.colors));
// //     const sizes = _.union(...totalProducts.map(v => v.sizes));
// //     const prices = totalProducts.map(v => v.price);
// //     res.status(200).json({
// //       success: true,
// //       data: { colors, sizes, prices: [Math.min(...prices), Math.max(...prices)] }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };
// const getProducts = async (req, res) => {
//   try {
//     const query = req.query;
//     let newQuery = { ...query };
//     [
//       "page",
//       "prices",
//       "sizes",
//       "colors",
//       "name",
//       "date",
//       "price",
//       "top",
//       "category",
//       "subCategory",
//     ].forEach((k) => delete newQuery[k]);

//     // parse filters
//     for (const [key, value] of Object.entries(newQuery)) {
//       newQuery = { ...newQuery, [key]: value.split("_") };
//     }

//     const category = query.category
//       ? await Category.findOne({ slug: query.category }).select("slug")
//       : null;
//     const subCategory = query.subCategory
//       ? await SubCategory.findOne({ slug: query.subCategory }).select("slug")
//       : null;
//     const skip = query.limit || 12;

//     // ---- 1️⃣ Log user role from middleware ----
//     console.log("User role from middleware:", req.user?.role);

//     const totalProducts = await Product.countDocuments({
//       ...newQuery,
//       ...(category && { category: category._id }),
//       ...(subCategory && { subCategory: subCategory._id }),
//       ...(query.sizes && { sizes: { $in: query.sizes.split("_") } }),
//       ...(query.colors && { colors: { $in: query.colors.split("_") } }),
//       priceSale: {
//         $gt: query.prices ? Number(query.prices.split("_")[0]) : 1,
//         $lt: query.prices ? Number(query.prices.split("_")[1]) : 1000000,
//       },
//       status: { $ne: "disabled" },
//     });

//     const minPrice = query.prices ? Number(query.prices.split("_")[0]) : 1;
//     const maxPrice = query.prices
//       ? Number(query.prices.split("_")[1])
//       : 10000000;

//     const priceFilter = query.prices
//       ? req.user?.role === "b2b"
//         ? {
//             $or: [
//               { priceSale: { $gte: minPrice, $lte: maxPrice } },
//               { wholesalePrice: { $gte: minPrice, $lte: maxPrice } },
//             ],
//           }
//         : { priceSale: { $gte: minPrice, $lte: maxPrice } }
//       : {};

//     const products = await Product.aggregate([
//       {
//         $lookup: {
//           from: "reviews",
//           localField: "reviews",
//           foreignField: "_id",
//           as: "reviews",
//         },
//       },
//       {
//         $addFields: {
//           averageRating: { $avg: "$reviews.rating" },
//           image: { $arrayElemAt: ["$images", 0] },
//         },
//       },
//       {
//         $match: {
//           ...(category && { category: category._id }),
//           ...(subCategory && { subCategory: subCategory._id }),
//           ...(query.isFeatured && { isFeatured: Boolean(query.isFeatured) }),
//           ...(query.sizes && { sizes: { $in: query.sizes.split("_") } }),
//           ...(query.colors && { colors: { $in: query.colors.split("_") } }),
//           ...priceFilter,
//           status: { $ne: "disabled" },
//         },
//       },
//       {
//         $project: {
//           image: { url: "$image.url", blurDataURL: "$image.blurDataURL" },
//           name: 1,
//           slug: 1,
//           colors: 1,
//           discount: 1,
//           likes: 1,
//           priceSale: 1,
//           price: 1,
//           averageRating: 1,
//           available: 1,
//           createdAt: 1,
//           wholesalePrice: 1,
//           tierPrices: 1,
//           weight: 1,
//         },
//       },
//       {
//         $sort: {
//           ...((query.date && { createdAt: Number(query.date) }) ||
//             (query.price && { priceSale: Number(query.price) }) ||
//             (query.name && { name: Number(query.name) }) ||
//             (query.top && { averageRating: Number(query.top) }) || {
//               averageRating: -1,
//             }),
//         },
//       },
//       {
//         $skip: Number(skip * ((query.page ? parseInt(query.page[0]) : 1) - 1)),
//       },
//       { $limit: Number(skip) },
//     ]);

//     // ---- 2️⃣ Log products before role pricing ----
//     console.log(
//       "Products before role pricing:",
//       products.map((p) => ({
//         name: p.name,
//         price: p.price,
//         wholesalePrice: p.wholesalePrice,
//       }))
//     );

//     // ---- 3️⃣ Apply role pricing and log results ----
//     const pricedProducts = withRolePricing(products, req.user?.role);
//     console.log(
//       "Products after role pricing:",
//       pricedProducts.map((p) => ({
//         name: p.name,
//         price: p.price,
//         wholesalePrice: p.wholesalePrice,
//       }))
//     );

//     res.status(200).json({
//       success: true,
//       data: pricedProducts,
//       total: totalProducts,
//       count: Math.ceil(totalProducts / skip),
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message, error });
//   }
// };

// // GET all products for admin
// const getProductsByAdmin = async (req, res) => {
//   try {
//     const {
//       page: pageQuery,
//       limit: limitQuery,
//       search: searchQuery,
//     } = req.query;
//     const limit = parseInt(limitQuery) || 10;
//     const page = parseInt(pageQuery) || 1;
//     const skip = limit * (page - 1);

//     const totalProducts = await Product.countDocuments({
//       name: { $regex: searchQuery || "", $options: "i" },
//     });
//     const products = await Product.aggregate([
//       { $match: { name: { $regex: searchQuery || "", $options: "i" } } },
//       { $sort: { createdAt: -1 } },
//       { $skip: skip },
//       { $limit: limit },
//       {
//         $lookup: {
//           from: "reviews",
//           localField: "reviews",
//           foreignField: "_id",
//           as: "reviews",
//         },
//       },
//       {
//         $addFields: {
//           averageRating: { $avg: "$reviews.rating" },
//           image: { $arrayElemAt: ["$images", 0] },
//         },
//       },
//       {
//         $project: {
//           image: { url: "$image.url", blurDataURL: "$image.blurDataURL" },
//           name: 1,
//           slug: 1,
//           colors: 1,
//           discount: 1,
//           likes: 1,
//           available: 1,
//           priceSale: 1,
//           price: 1,
//           averageRating: 1,
//           createdAt: 1,
//           wholesalePrice: 1,
//           tierPrices: 1,
//           weight: 1,
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: withRolePricing(products, req.user?.role),
//       total: totalProducts,
//       count: Math.ceil(totalProducts / limit),
//       currentPage: page,
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // CREATE product for admin
// const createProductByAdmin = async (req, res) => {
//   try {
//     await getAdmin(req, res);
//     const { images, ...body } = req.body;

//     if (body.tierPrices && !Array.isArray(body.tierPrices)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "tierPrices must be an array" });
//     }

//     const updatedImages = await Promise.all(
//       images.map(async (image) => ({
//         ...image,
//         blurDataURL: await blurDataUrl(image.url),
//       }))
//     );

//     ["subCategory", "metaTitle", "metaDescription"].forEach((key) => {
//       if (!body[key]) delete body[key];
//     });

//     const data = await Product.create({
//       ...body,
//       images: updatedImages,
//       likes: 0,
//     });
//     res.status(201).json({ success: true, message: "Product Created", data });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // GET one product by slug for admin
// const getOneProductByAdmin = async (req, res) => {
//   try {
//     const product = await Product.findOne({ slug: req.params.slug });
//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product Not Found" });
//     const category = await Category.findById(product.category).select([
//       "name",
//       "slug",
//     ]);

//     const reviewReport = await Product.aggregate([
//       { $match: { slug: req.params.slug } },
//       {
//         $lookup: {
//           from: "reviews",
//           localField: "_id",
//           foreignField: "product",
//           as: "reviews",
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//           rating: { $avg: "$reviews.rating" },
//           totalReviews: { $size: "$reviews" },
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: applyRolePricing(product, req.user?.role),
//       totalRating: reviewReport[0]?.rating,
//       totalReviews: reviewReport[0]?.totalReviews,
//       category,
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // UPDATE product for admin
// const updateProductByAdmin = async (req, res) => {
//   try {
//     await getAdmin(req, res);
//     const { slug } = req.params;
//     const { images, ...body } = req.body;

//     const updatedImages = await Promise.all(
//       images.map(async (image) => ({
//         ...image,
//         blurDataURL: await blurDataUrl(image.url),
//       }))
//     );

//     const updated = await Product.findOneAndUpdate(
//       { slug },
//       { ...body, images: updatedImages },
//       { new: true, runValidators: true }
//     );

//     res
//       .status(200)
//       .json({ success: true, data: updated, message: "Product Updated" });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // DELETE product for admin
// const deletedProductByAdmin = async (req, res) => {
//   try {
//     const slug = req.params.slug;
//     const product = await Product.findOne({ slug });
//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: "Item Not Found" });
//     if (product.images?.length) await multiFilesDelete(product.images);
//     await Product.deleteOne({ slug });
//     res.status(200).json({ success: true, message: "Product Deleted" });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // GET filters by category
// const getFiltersByCategory = async (req, res) => {
//   try {
//     const { category } = req.params;
//     const categoryData = await Category.findOne({ slug: category }).select([
//       "name",
//       "slug",
//     ]);
//     if (!categoryData)
//       return res
//         .status(404)
//         .json({ success: false, message: "Category Not Found" });

//     const totalProducts = await Product.find({
//       status: { $ne: "disabled" },
//       category: categoryData._id,
//     }).select(["colors", "sizes", "price"]);
//     const colors = _.union(...totalProducts.map((v) => v.colors));
//     const sizes = _.union(...totalProducts.map((v) => v.sizes));
//     const prices = totalProducts.map((v) => v.price);

//     res
//       .status(200)
//       .json({
//         success: true,
//         data: {
//           colors,
//           sizes,
//           prices: [Math.min(...prices), Math.max(...prices)],
//         },
//       });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // GET filters by subcategory
// const getFiltersBySubCategory = async (req, res) => {
//   try {
//     const { category, subcategory } = req.params;
//     const categoryData = await Category.findOne({ slug: category }).select([
//       "name",
//       "slug",
//     ]);
//     const subCategoryData = await SubCategory.findOne({
//       slug: subcategory,
//     }).select(["name", "slug"]);
//     if (!categoryData)
//       return res
//         .status(404)
//         .json({ success: false, message: "Category Not Found" });
//     if (!subCategoryData)
//       return res
//         .status(404)
//         .json({ success: false, message: "SubCategory Not Found" });

//     const totalProducts = await Product.find({
//       status: { $ne: "disabled" },
//       subCategory: subCategoryData._id,
//     }).select(["colors", "sizes", "price"]);
//     const colors = _.union(...totalProducts.map((v) => v.colors));
//     const sizes = _.union(...totalProducts.map((v) => v.sizes));
//     const prices = totalProducts.map((v) => v.price);

//     res
//       .status(200)
//       .json({
//         success: true,
//         data: {
//           colors,
//           sizes,
//           prices: [Math.min(...prices), Math.max(...prices)],
//         },
//       });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // GET all product slugs
// const getAllProductSlug = async (req, res) => {
//   try {
//     const products = await Product.find().select("slug");
//     res.status(200).json({ success: true, data: products });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // GET related products
// const relatedProducts = async (req, res) => {
//   try {
//     const pid = req.params.pid;
//     const product = await Product.findById(pid).select("_id category");

//     const related = await Product.aggregate([
//       {
//         $lookup: {
//           from: "reviews",
//           localField: "reviews",
//           foreignField: "_id",
//           as: "reviews",
//         },
//       },
//       {
//         $addFields: {
//           averageRating: { $avg: "$reviews.rating" },
//           image: { $arrayElemAt: ["$images", 0] },
//         },
//       },
//       { $match: { category: product.category, _id: { $ne: product._id } } },
//       { $limit: 8 },
//       {
//         $project: {
//           image: { url: "$image.url", blurDataURL: "$image.blurDataURL" },
//           name: 1,
//           slug: 1,
//           colors: 1,
//           available: 1,
//           discount: 1,
//           likes: 1,
//           priceSale: 1,
//           price: 1,
//           averageRating: 1,
//           createdAt: 1,
//           wholesalePrice: 1,
//           tierPrices: 1,
//           weight: 1,
//         },
//       },
//     ]);

//     res
//       .status(200)
//       .json({ success: true, data: withRolePricing(related, req.user?.role) });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // GET one product by slug for users
// const getOneProductBySlug = async (req, res) => {
//   try {
//     const product = await Product.findOne({ slug: req.params.slug });
//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product Not Found" });
//     const category = await Category.findById(product.category).select([
//       "name",
//       "slug",
//     ]);

//     const reviewReport = await Product.aggregate([
//       { $match: { slug: req.params.slug } },
//       {
//         $lookup: {
//           from: "reviews",
//           localField: "_id",
//           foreignField: "product",
//           as: "reviews",
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//           rating: { $avg: "$reviews.rating" },
//           totalReviews: { $size: "$reviews" },
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: applyRolePricing(product, req.user?.role),
//       totalRating: reviewReport[0]?.rating,
//       totalReviews: reviewReport[0]?.totalReviews,
//       category,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// module.exports = {
//   getProducts,
//   getProductsByAdmin,
//   createProductByAdmin,
//   getOneProductByAdmin,
//   updateProductByAdmin,
//   deletedProductByAdmin,
//   getFiltersByCategory,
//   getAllProductSlug,
//   getFiltersBySubCategory,
//   relatedProducts,
//   getOneProductBySlug,
// };

const Product = require("../models/Product");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const _ = require("lodash");
const { multiFilesDelete } = require("../config/uploader");
const blurDataUrl = require("../config/getBlurDataURL");
const { getAdmin } = require("../config/getUser");

// -------------------- Role-based pricing with variants --------------------
const applyRolePricing = (item, role) => {
  if (!item) return item;

  const isB2B = role === "b2b";
  const p = item.toObject ? item.toObject() : { ...item };

  if (Array.isArray(p.variants)) {
    p.variants = p.variants.map((variant) => {
      let v = { ...variant };

      if (isB2B) {
        // B2B → keep wholesale + tier pricing
        v.wholesalePrice = v.wholesalePrice ?? 0;
        v.tierPrices = v.tierPrices ?? [];
        v.priceSale = v.priceSale ?? v.price;
      } else {
        // Normal user → hide wholesalePrice, but KEEP tierPrices
        delete v.wholesalePrice;
        v.tierPrices = v.tierPrices ?? [];
      }

      return v;
    });
  }

  return p;
};


const withRolePricing = (arr, role) =>
  Array.isArray(arr) ? arr.map((x) => applyRolePricing(x, role)) : arr;

// -------------------- Controllers --------------------

// GET all products for users
const getProducts = async (req, res) => {
  try {
    const query = req.query;
    const skip = query.limit || 12;
    const minPrice = query.prices ? Number(query.prices.split("_")[0]) : 1;
    const maxPrice = query.prices
      ? Number(query.prices.split("_")[1])
      : 10000000;

    const category = query.category
      ? await Category.findOne({ slug: query.category }).select("_id")
      : null;
    const subCategory = query.subCategory
      ? await SubCategory.findOne({ slug: query.subCategory }).select("_id")
      : null;

    const matchConditions = {
      ...(category && { category: category._id }),
      ...(subCategory && { subCategory: subCategory._id }),
      status: { $ne: "disabled" },
    };

    // filter inside variants
    if (query.sizes) {
      matchConditions["variants.size"] = { $in: query.sizes.split("_") };
    }
    if (query.colors) {
      matchConditions["variants.color"] = { $in: query.colors.split("_") };
    }
    if (query.prices) {
      matchConditions["variants.price"] = { $gte: minPrice, $lte: maxPrice };
    }

    const totalProducts = await Product.countDocuments(matchConditions);

    const products = await Product.aggregate([
  {
    $lookup: {
      from: "reviews",
      localField: "reviews",
      foreignField: "_id",
      as: "reviews",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "createdBy",
      foreignField: "_id",
      as: "createdByUser",
    },
  },
  {
    $unwind: {
      path: "$createdByUser",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      averageRating: { $avg: "$reviews.rating" },
      image: { $arrayElemAt: ["$images", 0] },
      firstVariant: { $arrayElemAt: ["$variants", 0] },
    },
  },
  { $match: matchConditions },
  {
    $project: {
      image: { url: "$image.url", blurDataURL: "$image.blurDataURL" },
      name: 1,
      nameI18n: 1,
      code: 1,
      slug: 1,
      variants: 1,
      averageRating: 1,
      likes: 1,
      price: "$firstVariant.price",
      priceSale: "$firstVariant.priceSale",
      wholesalePrice: "$firstVariant.wholesalePrice",
      tierPrices: "$firstVariant.tierPrices",
      createdAt: 1,
      createdBy: {
        firstName: "$createdByUser.firstName",
        lastName: "$createdByUser.lastName",
      },
    },
  },
  { $skip: Number(skip * ((query.page ? parseInt(query.page) : 1) - 1)) },
  { $limit: Number(skip) },
]);


    res.status(200).json({
      success: true,
      data: withRolePricing(products, req.user?.role),
      total: totalProducts,
      count: Math.ceil(totalProducts / skip),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all products for admin
const getProductsByAdmin = async (req, res) => {
  try {
    const {
      page: pageQuery,
      limit: limitQuery,
      search: searchQuery,
    } = req.query;
    const limit = parseInt(limitQuery) || 10;
    const page = parseInt(pageQuery) || 1;
    const skip = limit * (page - 1);

    const totalProducts = await Product.countDocuments({
      name: { $regex: searchQuery || "", $options: "i" },
    });
    const products = await Product.aggregate([
      { $match: { name: { $regex: searchQuery || "", $options: "i" } } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          image: { $arrayElemAt: ["$images", 0] },
          firstVariant: { $arrayElemAt: ["$variants", 0] },
        },
      },
      {
        $project: {
          image: { url: "$image.url", blurDataURL: "$image.blurDataURL" },
          name: 1,
          nameI18n: 1,
          code: 1,
          slug: 1,
          variants: 1,
          averageRating: 1,
          price: "$firstVariant.price",
          priceSale: "$firstVariant.priceSale",
          wholesalePrice: "$firstVariant.wholesalePrice",
          tierPrices: "$firstVariant.tierPrices",
          createdAt: 1,
          likes: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: withRolePricing(products, req.user?.role),
      total: totalProducts,
      count: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// CREATE product for admin
const createProductByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { images, variants, ...body } = req.body;
    // Ensure legacy fields exist from i18n inputs
    if (!body.name && body?.nameI18n?.en) body.name = body.nameI18n.en;
    if (!body.description && body?.descriptionI18n?.en)
      body.description = body.descriptionI18n.en;
    if (!body.metaTitle && body?.metaTitleI18n?.en) body.metaTitle = body.metaTitleI18n.en;
    if (!body.metaDescription && body?.metaDescriptionI18n?.en)
      body.metaDescription = body.metaDescriptionI18n.en;

    if (!Array.isArray(images)) {
      return res
        .status(400)
        .json({ success: false, message: "'images' must be an array" });
    }

    if (!Array.isArray(variants)) {
      return res
        .status(400)
        .json({ success: false, message: "'variants' must be an array" });
    }

    // process product images
    const updatedImages = await Promise.all(
      images.map(async (image) => ({
        ...image,
        blurDataURL: await blurDataUrl(image.url),
      }))
    );

    // process variant images
    const updatedVariants = await Promise.all(
      variants.map(async (variant) => {
        const newVariant = {
          size: variant.size,
          color: variant.color,
          kind: variant.kind,
          price: variant.price,
          priceSale: variant.priceSale,
          wholesalePrice: variant.wholesalePrice ?? 0,
          tierPrices: variant.tierPrices ?? [],
        };

        if (variant.image?.url) {
          newVariant.image = {
            url: variant.image.url,
            blurDataURL: await blurDataUrl(variant.image.url),
          };
        }

        return newVariant;
      })
    );

    const data = await Product.create({
      ...body,
      images: updatedImages,
      variants: updatedVariants,
      likes: 0,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: "Product Created", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET one product by slug for admin
const getOneProductByAdmin = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product Not Found" });

    // Resolve category whether stored as ObjectId or legacy slug string
    let category;
    try {
      if (
        product.category &&
        typeof product.category === "string" &&
        !require("mongoose").Types.ObjectId.isValid(product.category)
      ) {
        category = await Category.findOne({ slug: product.category }).select([
          "name",
          "slug",
        ]);
      } else {
        category = await Category.findById(product.category).select([
          "name",
          "slug",
        ]);
      }
    } catch (_) {
      category = null;
    }

    const reviewReport = await Product.aggregate([
      { $match: { slug: req.params.slug } },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          rating: { $avg: "$reviews.rating" },
          totalReviews: { $size: "$reviews" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: applyRolePricing(product, req.user?.role),
      totalRating: reviewReport[0]?.rating,
      totalReviews: reviewReport[0]?.totalReviews,
      category,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// UPDATE product for admin
const updateProductByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { slug } = req.params;
    const { images, variants, ...body } = req.body;

    if (!Array.isArray(images)) {
      return res
        .status(400)
        .json({ success: false, message: "'images' must be an array" });
    }

    if (!Array.isArray(variants)) {
      return res
        .status(400)
        .json({ success: false, message: "'variants' must be an array" });
    }

    const updatedImages = await Promise.all(
      images.map(async (image) => ({
        ...image,
        blurDataURL: await blurDataUrl(image.url),
      }))
    );

    const updatedVariants = await Promise.all(
      variants.map(async (variant) => ({
        ...variant,
        image: variant.image?.url
          ? {
              url: variant.image.url,
              blurDataURL: await blurDataUrl(variant.image.url),
            }
          : {},
      }))
    );

    // Ensure legacy fields exist from i18n inputs
    if (!body.name && body?.nameI18n?.en) body.name = body.nameI18n.en;
    if (!body.description && body?.descriptionI18n?.en)
      body.description = body.descriptionI18n.en;
    if (!body.metaTitle && body?.metaTitleI18n?.en) body.metaTitle = body.metaTitleI18n.en;
    if (!body.metaDescription && body?.metaDescriptionI18n?.en)
      body.metaDescription = body.metaDescriptionI18n.en;

    // Build $set update for robust nested field updates
    const setOps = {
      images: updatedImages,
      variants: updatedVariants,
      ...body,
    };
    if (body.nameI18n) {
      ['en', 'km', 'zh'].forEach((k) =>
        Object.prototype.hasOwnProperty.call(body.nameI18n, k) &&
        (setOps[`nameI18n.${k}`] = body.nameI18n[k])
      );
      delete setOps.nameI18n;
    }
    if (body.descriptionI18n) {
      ['en', 'km', 'zh'].forEach((k) =>
        Object.prototype.hasOwnProperty.call(body.descriptionI18n, k) &&
        (setOps[`descriptionI18n.${k}`] = body.descriptionI18n[k])
      );
      delete setOps.descriptionI18n;
    }
    if (body.metaTitleI18n) {
      ['en', 'km', 'zh'].forEach((k) =>
        Object.prototype.hasOwnProperty.call(body.metaTitleI18n, k) &&
        (setOps[`metaTitleI18n.${k}`] = body.metaTitleI18n[k])
      );
      delete setOps.metaTitleI18n;
    }
    if (body.metaDescriptionI18n) {
      ['en', 'km', 'zh'].forEach((k) =>
        Object.prototype.hasOwnProperty.call(body.metaDescriptionI18n, k) &&
        (setOps[`metaDescriptionI18n.${k}`] = body.metaDescriptionI18n[k])
      );
      delete setOps.metaDescriptionI18n;
    }

    const updated = await Product.findOneAndUpdate(
      { slug },
      { $set: setOps },
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .json({ success: true, data: updated, message: "Product Updated" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE product for admin
const deletedProductByAdmin = async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await Product.findOne({ slug });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Item Not Found" });
    if (product.images?.length) await multiFilesDelete(product.images);
    await Product.deleteOne({ slug });
    res.status(200).json({ success: true, message: "Product Deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET filters by category
const getFiltersByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const categoryData = await Category.findOne({ slug: category }).select([
      "_id",
    ]);
    if (!categoryData)
      return res
        .status(404)
        .json({ success: false, message: "Category Not Found" });

    const totalProducts = await Product.find({
      status: { $ne: "disabled" },
      category: categoryData._id,
    }).select(["variants"]);

    const colors = _.union(
      ...totalProducts.map((p) => p.variants.map((v) => v.color))
    );
    const sizes = _.union(
      ...totalProducts.map((p) => p.variants.map((v) => v.size))
    );
    const prices = totalProducts.flatMap((p) => p.variants.map((v) => v.price));

    res.status(200).json({
      success: true,
      data: {
        colors,
        sizes,
        prices: [Math.min(...prices), Math.max(...prices)],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET filters by subcategory
const getFiltersBySubCategory = async (req, res) => {
  try {
    const { category, subcategory } = req.params;
    const subCategoryData = await SubCategory.findOne({
      slug: subcategory,
    }).select(["_id"]);
    if (!subCategoryData)
      return res
        .status(404)
        .json({ success: false, message: "SubCategory Not Found" });

    const totalProducts = await Product.find({
      status: { $ne: "disabled" },
      subCategory: subCategoryData._id,
    }).select(["variants"]);

    const colors = _.union(
      ...totalProducts.map((p) => p.variants.map((v) => v.color))
    );
    const sizes = _.union(
      ...totalProducts.map((p) => p.variants.map((v) => v.size))
    );
    const prices = totalProducts.flatMap((p) => p.variants.map((v) => v.price));

    res.status(200).json({
      success: true,
      data: {
        colors,
        sizes,
        prices: [Math.min(...prices), Math.max(...prices)],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all product slugs
const getAllProductSlug = async (req, res) => {
  try {
    const products = await Product.find().select("slug");
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET related products
const relatedProducts = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await Product.findById(pid).select("_id category");
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product Not Found" });
    }

    const related = await Product.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          image: { $arrayElemAt: ["$images", 0] },
          firstVariant: { $arrayElemAt: ["$variants", 0] },
        },
      },
      { $match: { category: product.category, _id: { $ne: product._id } } },
      { $limit: 8 },
      {
        $project: {
          image: { url: "$image.url", blurDataURL: "$image.blurDataURL" },
          name: 1,
          code: 1,
          slug: 1,
          variants: 1,
          averageRating: 1,
          price: "$firstVariant.price",
          priceSale: "$firstVariant.priceSale",
          wholesalePrice: "$firstVariant.wholesalePrice",
          tierPrices: "$firstVariant.tierPrices",
          createdAt: 1,
          likes: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: withRolePricing(related, req.user?.role),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET one product by slug for users
const getOneProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product Not Found" });

    // Resolve category whether stored as ObjectId or legacy slug string
    let category;
    try {
      if (
        product.category &&
        typeof product.category === "string" &&
        !require("mongoose").Types.ObjectId.isValid(product.category)
      ) {
        category = await Category.findOne({ slug: product.category }).select([
          "name",
          "slug",
        ]);
      } else {
        category = await Category.findById(product.category).select([
          "name",
          "slug",
        ]);
      }
    } catch (_) {
      category = null;
    }

    const reviewReport = await Product.aggregate([
      { $match: { slug: req.params.slug } },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          rating: { $avg: "$reviews.rating" },
          totalReviews: { $size: "$reviews" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: applyRolePricing(product, req.user?.role),
      totalRating: reviewReport[0]?.rating,
      totalReviews: reviewReport[0]?.totalReviews,
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductsByAdmin,
  createProductByAdmin,
  getOneProductByAdmin,
  updateProductByAdmin,
  deletedProductByAdmin,
  getFiltersByCategory,
  getAllProductSlug,
  getFiltersBySubCategory,
  relatedProducts,
  getOneProductBySlug,
};
