const validator = require("validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Customer = require("../models/customer.model");
const ApiError = require("../utils/ApiError");

const validateSignupData = (req) => {
    const { name, email, mobileNumber, address, password } = req.body;

    // Validate required fields
    if (!name?.trim() || !mobileNumber?.trim() || !address?.trim()) {
        throw new ApiError(400, "All fields are required: name, mobileNumber, and address.");
    }

    // Validate email
    if (!email || !validator.isEmail(email)) {
        throw new ApiError(400, `Invalid email address: ${email || "Email undefined"}`);
    }

    // Validate password strength
    if (!password || !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })) {
        throw new ApiError(400, "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol.");
    }
};

const authenticateUser = async (req, res, next) => {
    const { token } = req.cookies;

    try {
        if (!token) {
            throw new ApiError(401, "Please log in first.");
        }

        const decodedData = jwt.verify(token, "MybestFriend123123@");
        const user = await User.findById(decodedData._id);

        if (!user) {
            throw new ApiError(401, "Invalid user. Please log in again.");
        }

        req.user = user; // Attach user details to the request object
        next();
    } catch (err) {
        next(err);
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required.");
        }

        if (!roles.includes(req.user.designation)) {
            throw new ApiError(403, "Access denied. Insufficient permissions.");
        }

        next();
    };
};

const authenticateLogin = async(req, res, next) =>{
    const { token } = req.cookies;

    try {
        // Check if token exists
        if (!token) {
            throw new ApiError(401, "Please log in");
        }

        // Verify and decode the JWT
        const decodedToken = jwt.verify(token, "MybestFriend123123@");
        const userId = decodedToken._id;

        // Search in the Customer model first
        let userProfile = await Customer.findById(userId).select("-password");

        // If not found in Customer, search in User
        if (!userProfile) {
            userProfile = await User.findById(userId).select("-password");
        }

        // If not found in both, throw an error
        if (!userProfile) {
            throw new ApiError(404, "User not found.");
        }

        req.user = userProfile; // Attach user details to the request object
        next();
    } catch (err) {
        next(err);
    }
};

const CheckExistingUserOrCustomer = async(req, res, next)=>{

    const { identifier } = req.body;

    try {
        // Validate input
        if (!identifier?.trim()) {
            throw new ApiError(400, "Please provide a valid Email or Mobile Number.");
        }

        // Search in the Customer model first
        let user = await Customer.findOne({
            $or: [{ email: identifier }, { mobileNumber: identifier }]
        }).select("-password");

        // If not found in Customer, search in User
        if (!user) {
            user = await User.findOne({
                $or: [{ email: identifier }, { mobileNumber: identifier }]
            }).select("-password");
        }

        // If not found in both models, throw an error
        if (!user) {
            throw new ApiError(404, "User not found.");
        };

        req.user = user;
        next();

    } catch (err) {
        next(err);
    }
};


module.exports = {
    validateSignupData,
    authenticateUser, 
    authorizeRoles, 
    authenticateLogin,
    CheckExistingUserOrCustomer
};
