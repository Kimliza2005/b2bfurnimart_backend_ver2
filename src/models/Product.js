// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//     },
//     code: {
//       type: String,
//     },
//     status: {
//       type: String,
//     },
//     isFeatured: {
//       type: Boolean,
//     },
//     // brand: {
//     //   type: mongoose.Types.ObjectId,
//     //   ref: 'Brand',
//     // },
//     likes: {
//       type: Number,
//     },
//     description: {
//       type: String,
//     },
//     metaTitle: {
//       type: String,
//     },
//     metaDescription: {
//       type: String,
//     },
//     slug: {
//       type: String,
//       unique: true,
//     },
//     category: {
//       type: mongoose.Types.ObjectId,
//       ref: 'Category',
//       required: [true, 'please provide a category id'],
//     },
//     subCategory: {
//       type: mongoose.Types.ObjectId,
//       ref: 'SubCategory',
//       required: [false, 'please provide a sub category id'],
//     },
//     // gender: {
//     //   type: String,
//     // },
//     tags: [String],
//     price: {
//       type: Number,
//       required: [true, 'Price is required.'],
//     },
//     priceSale: {
//       type: Number,
//       required: [true, 'Sale price is required.'],
//     },
//     wholesalePrice: {
//       type: Number,
//       default: 0,
//     },
//     tierPrices: [
//       {
//         minQty: { type: Number, required: true },
//         pricePerUnit: { type: Number, required: true }
//       }
//     ],
//     // weight: {
//     //   type: Number,
//     //   required: [true, 'Weight is required.'],
//     // },
//     available: {
//       type: Number,
//       required: [true, 'Available quantity is required.'],
//     },
//     sold: {
//       type: Number,
//       default: 0,
//     },
//     reviews: [
//       {
//         type: mongoose.Types.ObjectId,
//         ref: 'Review',
//       },
//     ],

//     // shop: {
//     //   type: mongoose.Schema.Types.ObjectId,
//     //   ref: 'Shop',
//     //   required: true,
//     // },
//     images: [
//       {
//         url: {
//           type: String,
//           required: [true],
//         },
//         _id: {
//           type: String,
//           required: [true],
//         },
//         blurDataURL: {
//           type: String,
//           required: [true, 'image-blur-data-url-required-error'],
//         },
//       },
//     ],

//     colors: [String],
//     sizes: [String],
//   },
//   { timestamps: true, strict: true }
// );

// const Product =
//   mongoose.models.Product || mongoose.model('Product', productSchema);
// module.exports = Product;
const mongoose = require("mongoose");

const tierPriceSchema = new mongoose.Schema({
  minQty: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
});

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  kind: { type: String, required: true },
  price: { type: Number, required: false, default: 0 }, // now optional
  priceSale: { type: Number, required: false, default: 0 }, // optional
  wholesalePrice: { type: Number, required: false, default: 0 },
  tierPrices: { type: [tierPriceSchema], default: [] }, // optional array
  image: {
    url: { type: String, default: "" },
    blurDataURL: { type: String, default: "" },
  },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // Multilingual fields similar to Category/SubCategory
    nameI18n: {
      en: { type: String, default: "" },
      km: { type: String, default: "" },
      zh: { type: String, default: "" },
    },
    code: { type: String, default: "" },
    status: { type: String, default: "active" },
    isFeatured: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    description: { type: String, default: "" },
    descriptionI18n: {
      en: { type: String, default: "" },
      km: { type: String, default: "" },
      zh: { type: String, default: "" },
    },
    metaTitle: { type: String, default: "" },
    metaTitleI18n: {
      en: { type: String, default: "" },
      km: { type: String, default: "" },
      zh: { type: String, default: "" },
    },
    metaDescription: { type: String, default: "" },
    metaDescriptionI18n: {
      en: { type: String, default: "" },
      km: { type: String, default: "" },
      zh: { type: String, default: "" },
    },
    slug: { type: String, unique: true },

    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User", // reference to your User model
      required: true,
    },

    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "please provide a category id"],
    },
    
    subCategory: { type: mongoose.Types.ObjectId, ref: "SubCategory" },
    tags: { type: [String], default: [] },
    reviews: [{ type: mongoose.Types.ObjectId, ref: "Review", default: [] }],
    images: [
      {
        url: { type: String, required: true },
        _id: { type: String, required: true },
        blurDataURL: {
          type: String,
          required: [true, "image-blur-data-url-required-error"],
        },
      },
    ],
    variants: { type: [variantSchema], default: [] }, // safe default
  },
  { timestamps: true, strict: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
module.exports = Product;
