const User = require('../model/user');
const CacDetails = require('../model/clusterAcademycoordinator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const successResponse = require("../utils/suceesResponse")
const customError = require("../utils/customErrorHandler")
const asyncHandler = require("../middleware/asyncHandler")


const validateRegistrationInput = ({ email, password, phoneNo }) => {
    if (!phoneNo) {
        throw new customError('Mobile field is required!', 400);
    }
    if (!email) {
        throw new customError('Teacher ID (email) is required!', 400);
    }
    if (!password) {
        throw new customError('Please set your password.', 400);
    }
};

const registerUser = asyncHandler(async (req, res, next) => {
    try {
        const { email, password, phoneNo } = req.body;
        validateRegistrationInput({ email, password, phoneNo });
        const [cacMatched, existingRegisteredCac] = await Promise.all([
            CacDetails.findOne({ cac_mobile: parseInt(phoneNo) }),
            User.findOne({ phoneNo: phoneNo }),
        ]);
       
        if (!cacMatched) {
            throw new customError('Invalid CAC ID.', 200);
        }
        if (existingRegisteredCac) {
            throw new customError('CAC is already registered.', 409);
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newRegisteredCac = new User({
            name: cacMatched.c_name || '',
            gender: cacMatched.gender || '',
            phoneNo: cacMatched.cac_mobile || '',
            clusterId: cacMatched.udise_cluster_code || '',
            clusterName: cacMatched.cluster_name || '',
            blockId: cacMatched.udise_block_code || '',
            blockName: cacMatched.Block || '',
            districtId: cacMatched.udise_dist_code || '',
            districtName: cacMatched.Dist || '',
            email: email || '',
            password: hashedPassword,
        });

        await newRegisteredCac.save();
        return successResponse(res, 201, 'CAC registered successfully.', newRegisteredCac);
    } catch (error) {
        console.error('Registration Error:', error.message);
        return next(error);
    }
});

const loginUser = asyncHandler(async (req, res, next) => {
    try {
        const { phoneNo, password } = req.body;

        // Validate input
        if (!phoneNo || !password) {
            return next(new customError('Phone number and password are required!', 200));
        }

        const user = await User.findOne({ phoneNo });
        if (!user) {
            return next(new customError('Invalid credentials', 200));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new customError('Invalid credentials', 200));
        }

        // Generate JWT token
        const token = jwt.sign({ user: user._id }, process.env.secertKey);
        user.token = token;
        await user.save();
        const action = "/cacDashboard"
       
         const data = {
            ...user.toObject(),
            role: user ? "CAC" : null,
          };
          delete data.password;
          delete data.createdAt;
          delete data.updatedAt;
        return res.json({success:true,message:"Login Success",data,action})
    } catch (error) {
        console.error('Login Error:', error.message);
        return next(new customError('Server Error', 500));
    }
}
)
// Delete User
const deleteUser = asyncHandler(async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new customError('Email is required!', 400));
        }

        const user = await User.findOneAndDelete({ email });
        if (!user) {
            return next(new customError('User not found', 404));
        }

        // Send success response
        return successResponse(res, 200, 'User deleted successfully');
    } catch (error) {
        console.error('Delete Error:', error.message);
        return next(new customError('Server Error', 500));
    }
})
// Update User
const updateUser = asyncHandler(async (req, res, next) => {
    try {
        const { email, ...updates } = req.body;

        if (!email) {
            return next(new customError('Email is required!', 400));
        }

        const user = await User.findOneAndUpdate({ email }, updates, { new: true });
        if (!user) {
            return next(new customError('User not found', 404));
        }

        // Send success response
        return successResponse(res, 200, 'User updated successfully', user);
    } catch (error) {
        console.error('Update Error:', error.message);
        return next(new customError('Server Error', 500));
    }
})

// Get All Users
const getAllUsers = asyncHandler(async (req, res, next) => {
    try {
        const users = await User.find();

        if (!users || users.length === 0) {
            return next(new customError('No users found', 404));
        }

        // Send success response
        return successResponse(res, 200, 'Users retrieved successfully', users);
    } catch (error) {
        console.error('Get All Users Error:', error.message);
        return next(new customError('Server Error', 500));
    }
})
// Get Single User
const getSingleUser = asyncHandler(async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new customError('Email is required!', 400));
        }

        const user = await User.findOne({ email });

        if (!user) {
            return next(new customError('User not found', 404));
        }

        // Send success response
        return successResponse(res, 200, 'User retrieved successfully', user);
    } catch (error) {
        console.error('Get Single User Error:', error.message);
        return next(new customError('Server Error', 500));
    }
})


module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getSingleUser,
    deleteUser,
    updateUser

}