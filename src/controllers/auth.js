const User = require("../models/User");
const Products = require("../models/Product");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");

const registerUser = async (req, res) => {
  try {
    const { phone, firstName, lastName, password, gender, role } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone is required" });
    }

    const UserCount = await User.countDocuments();
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({
        UserCount,
        success: false,
        message: "User with this phone already exists",
      });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    // const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    // const hashedPassword = await bcrypt.hash(password, 10);
    // const otp = otpGenerator.generate(6, {
    //   upperCaseAlphabets: false,
    //   specialChars: false,
    //   lowerCaseAlphabets: false,
    //   digits: true,
    // });

    // const user = await User.create({
    //   phone,
    //   firstName,
    //   lastName,
    //   gender,
    //   otp,
    //   isVerified: false,
    //   password: hashedPassword,
    //   role: UserCount ? role || 'user' : 'super admin',
    // });
    const user = await User.create({
      phone,
      firstName,
      lastName,
      gender,
      isVerified: true, // auto-verify for now
      password, // <-- pass raw password, schema will hash it
      role: UserCount ? role || "user" : "super admin",
    });

    // console.log(`Send OTP ${otp} to phone ${phone}`);

    const token = jwt.sign(
      {
        _id: user._id,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // return res.status(201).json({
    //   success: true,
    //   message: "Created User Successfully, please verify OTP",
    //   otp,
    //   token,
    //   user,
    // });

    return res.status(201).json({
      success: true,
      message: "Created User Successfully",
      token,
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and password required" });
    }

    const user = await User.findOne({ phone }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    if (!user.password) {
      return res
        .status(404)
        .json({ success: false, message: "User Password Not Found" });
    }

    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "User not verified. Please verify OTP.",
    //   });
    // }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect Password" });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const products = await Products.aggregate([
      {
        $match: {
          _id: { $in: user.wishlist },
        },
      },
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
        },
      },
      {
        $project: {
          image: { url: "$image.url", blurDataURL: "$image.blurDataURL" },
          name: 1,
          slug: 1,
          colors: 1,
          discount: 1,
          available: 1,
          likes: 1,
          priceSale: 1,
          price: 1,
          averageRating: 1,
          createdAt: 1,
        },
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Login Successfully",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        cover: user.cover,
        gender: user.gender,
        address: user.address,
        city: user.city,
        country: user.country,
        zip: user.zip,
        state: user.state,
        about: user.about,
        role: user.role,
        wishlist: products,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const request = req.body;
    const { phone, origin } = request;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone is required" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found " });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // Constructing the link with the token
    const resetPasswordLink = `${origin}/auth/reset-password/${token}`;

    // You may want to replace the below with SMS sending code for phone
    console.log(
      `Send password reset link to phone ${phone}: ${resetPasswordLink}`
    );

    return res.status(200).json({
      success: true,
      message: "Forgot Password Link Sent Successfully.",
      token,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Token and newPassword required" });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid Or Expired Token. Please Request A New One.",
      });
    }

    // Find the user by ID from the token
    const user = await User.findById(decoded._id).select("password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found ",
      });
    }
    if (!newPassword || !user.password) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Data. Both NewPassword And User Password Are Required.",
      });
    }

    // Check if the new password is the same as the old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New Password Must Be Different From The Old Password.",
      });
    }
    // Update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Password Updated Successfully.",
      user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP required" });
    }

    // Find the user with the provided phone
    const user = await User.findOne({ phone }).maxTimeMS(30000).exec();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP Has Already Been Verified",
      });
    }

    if (otp === user.otp) {
      user.isVerified = true;
      user.otp = null; // clear otp after verification
      await user.save();
      return res
        .status(201)
        .json({ success: true, message: "OTP Verified Successfully" });
    } else {
      return res.status(404).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone is required" });
    }

    const user = await User.findOne({ phone }).maxTimeMS(30000).exec();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP Has Already Been Verified",
      });
    }

    // Generate new OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });

    user.otp = otp.toString();
    await user.save();

    // Log OTP for now, replace with SMS later
    console.log(`Resent OTP ${otp} to phone ${phone}`);

    return res.status(200).json({
      success: true,
      message: "OTP Resent Successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgetPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
};
