const User = require("../models/User");
const Order = require("../models/Order");
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');


const getUsersByAdmin = async (req, res) => {
	try {
		const { limit = 10, page = 1, search = "" } = req.query;

		const skip = parseInt(limit) * (parseInt(page) - 1) || 0;

		// Constructing nameQuery based on search input
		const nameQuery = search
			? {
				$or: [
					{ firstName: { $regex: search, $options: "i" } },
					{ lastName: { $regex: search, $options: "i" } },
					{ phone: { $regex: search, $options: "i" } },
				],
			}
			: {};

		const totalUserCounts = await User.countDocuments(nameQuery);

		const users = await User.find(nameQuery, null, {
			skip: skip,
			limit: parseInt(limit),
		}).sort({
			createdAt: -1,
		});

		return res.status(200).json({
			success: true,
			data: users,
			count: Math.ceil(totalUserCounts / parseInt(limit)),
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
};
const getOrdersByUid = async (req, res) => {
	try {
		const id = req.params.id;
		const { limit = 10, page = 1 } = req.query;

		const skip = parseInt(limit) * (parseInt(page) - 1) || 0;

		const currentUser = await User.findById(id);

		const totalOrders = await Order.countDocuments({ "user._id": id });

		const orders = await Order.find({ "user._id": id }, null, {
			skip: skip,
			limit: parseInt(limit),
		}).sort({
			createdAt: -1,
		});

		if (!currentUser) {
			return res
				.status(404)
				.json({ success: false, message: "User Not Found" });
		}

		return res.status(200).json({
			success: true,
			user: currentUser,
			orders,
			count: Math.ceil(totalOrders / parseInt(limit)),
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
};

const UpdateRoleByAdmin = async (req, res) => {
	try {
		const id = req.params.id;
		const userToUpdate = await User.findById(id);

		if (!userToUpdate) {
			return res
				.status(404)
				.json({ success: false, message: "User Not Found." });
		}

		// Check if the user to update is a super admin
		if (userToUpdate.role === "super admin") {
			return res.status(403).json({
				success: false,
				message: "Cannot Change The Role Of A Super Admin.",
			});
		}

		// Toggle the user's role
		const newRole = userToUpdate.role === "user" ? "admin" : "user";

		// Update the user's role
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ role: newRole },
			{ new: true, runValidators: true }
		);

		return res.status(200).json({
			success: true,
			message: `${updatedUser.firstName} Is Now ${newRole}.`,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

const createB2BUserByAdmin = async (req, res) => {
  try {
    const { phone, firstName, lastName, password, gender, b2bDetails } = req.body;

    if (!phone || !firstName || !lastName || !password || !gender) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      phone,
      firstName,
      lastName,
      gender,
      password: hashedPassword,
      role: 'b2b',
      isVerified: true, // Mark verified since admin created the account
    });

    await newUser.save();

    res.status(201).json({ message: 'B2B user created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
	getUsersByAdmin,
	getOrdersByUid,
	UpdateRoleByAdmin,
	createB2BUserByAdmin
};
