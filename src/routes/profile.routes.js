const express = require("express");
const profileRouter = express.Router();
const { authenticateUser, authorizeRoles, authenticateLogin, CheckExistingUserOrCustomer } = require("../middlewares/auth.middleware");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Customer = require("../models/customer.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");

const secretKey = process.env.JWT_SECRET;


// Create User by users
profileRouter.post("/auth/user/create", authenticateUser, authorizeRoles("Admin"), async (req, res, next) => {

    const { 
        name, email, mobileNumber, address, avatar, city, state, pinCode, gender, 
        dateOfBirth, marrigeAniversary, bio, joiningDate, refferedBy, designation, 
        dapartment, emergencyContactPerson, emergencyContactNumber, bloodGroup, 
        identityDocument, documentNumber, communication, salesCommission, remark 
    } = req.body;

    try {
        // Validate required fields
        if (!name?.trim() || !mobileNumber?.trim() || !address?.trim()) {
            throw new ApiError(400, "All fields are required: name, mobileNumber, and address.");
        }

        // Check if the identifier (email or mobileNumber) already exists in the Customer model
        const existingCustomer = await Customer.findOne({
            $or: [{ email }, { mobileNumber }],
        });

        if (existingCustomer) {
            throw new ApiError(
                409,
                "A customer with this email or mobile number already exists."
            );
        }

        // Check if the identifier (email or mobileNumber) already exists in the User model
        const existingUser = await User.findOne({
            $or: [{ email }, { mobileNumber }],
        });

        if (existingUser) {
            throw new ApiError(
                409,
                "A user with this email or mobile number already exists."
            );
        }

        // Generate a default password and hash it
        const password = "ShekharMobiles9@";
        const hashPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email,
            mobileNumber,
            address,
            password: hashPassword,
            avatar,
            city,
            state,
            pinCode,
            gender,
            dateOfBirth,
            marrigeAniversary,
            bio,
            joiningDate,
            refferedBy,
            designation,
            dapartment,
            emergencyContactPerson,
            emergencyContactNumber,
            bloodGroup,
            identityDocument,
            documentNumber,
            communication,
            salesCommission,
            remark,
        });

        await user.save();

        // Fetch the newly created user excluding the password
        const createdUser = await User.findById(user._id).select("-password");

        // Respond with success
        res.status(201).json(
            new ApiResponse(201, createdUser, "User registered successfully.")
        );
    } catch (err) {
        next(err);
    }
});


// Get full profile (User or Customer)
profileRouter.get("/profile", authenticateLogin, async (req, res, next) => {

    try {
        // Respond with the profile details
        const user = req.user
        res.status(200).json(new ApiResponse(200, user, "Profile fetched successfully."));
    } catch (err) {
        next(err);
    }
});



// Search a user by email or mobile number (in Customer or User model)
profileRouter.get("/user/search", CheckExistingUserOrCustomer, async (req, res, next) => {
    
    try { 
        const user = req.user;
        res.status(200).json(new ApiResponse(200, user, "User found successfully."));
    } catch (err) {
        next(err);
    }
});


// Update login user or customer details
profileRouter.patch("/user/update", async (req, res, next) => {
    const data = req.body;
    const { token } = req.cookies;

    try {
        // Ensure user is logged in
        if (!token) {
            throw new ApiError(401, "Please log in first.");
        }

        // Validate fields that are allowed to update
        const UPDATE_ALLOWED = [
            "name", "email", "mobileNumber", "address", "avatar", "city", "state", 
            "pinCode", "gender", "dateOfBirth", "marrigeAniversary", "bio", 
            "emergencyContactPerson", "emergencyContactNumber", "bloodGroup", 
            "communication", "remark"
        ];

        const updateFields = Object.keys(data);
        const invalidFields = updateFields.filter((key) => !UPDATE_ALLOWED.includes(key));

        if (invalidFields.length > 0) {
            throw new ApiError(403, `Updating these fields is not allowed: ${invalidFields.join(", ")}`);
        }

        // Decode token to get user ID
        const decodedMessage = jwt.verify(token, secretKey);
        const userId = decodedMessage._id;

        // Try updating in Customer model first
        let user = await Customer.findByIdAndUpdate(
            userId,
            { $set: data },
            { returnDocument: "after", runValidators: true }
        ).select("-password");

        // If not found in Customer, try User model
        if (!user) {
            user = await User.findByIdAndUpdate(
                userId,
                { $set: data },
                { returnDocument: "after", runValidators: true }
            ).select("-password");
        }

        // If user not found in both models
        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        // Respond with success message
        res.status(200).json(new ApiResponse(200, user, `Hey ${user.name}, your profile has been updated successfully.`));
    } catch (err) {
        next(err);
    }
});


// Update user details by Admin
profileRouter.patch("/admin/user/update", authenticateUser, authorizeRoles("Admin"), async (req, res, next) => {
    const { userId, ...data } = req.body;

    try {
        // Validate input
        if (!userId || Object.keys(data).length === 0) {
            throw new ApiError(400, "Please provide a valid userId and updates.");
        }

        // Define allowed fields for updates
        const UPDATE_ALLOWED = [
            "name", "email", "mobileNumber", "address", "avatar", "city", "state",
            "pinCode", "gender", "dateOfBirth", "marrigeAniversary", "bio", "joiningDate",
            "refferedBy", "designation", "dapartment", "emergencyContactPerson",
            "emergencyContactNumber", "bloodGroup", "identityDocument", "documentNumber",
            "communication", "salesCommission", "remark"
        ];

        const updateFields = Object.keys(data);
        const invalidFields = updateFields.filter((key) => !UPDATE_ALLOWED.includes(key));

        if (invalidFields.length > 0) {
            throw new ApiError(403, `Updating these fields is not allowed: ${invalidFields.join(", ")}`);
        }

        // Attempt to update in Customer model first
        let updatedUser = await Customer.findByIdAndUpdate(
            userId,
            { $set: data },
            { new: true, runValidators: true }
        ).select("-password");

        // If not found in Customer model, try User model
        if (!updatedUser) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: data },
                { new: true, runValidators: true }
            ).select("-password");
        }

        // If no record found in either model
        if (!updatedUser) {
            throw new ApiError(404, "User not found.");
        }

        // Return success response
        res.status(200).json(new ApiResponse(200, updatedUser, `${updatedUser.name}'s profile has been updated successfully.`));
    } catch (err) {
        next(err);
    }
});


// Change password for User or Customer
profileRouter.patch("/password/change", async (req, res, next) => {
    const { identifier, oldPassword, newPassword } = req.body;

    try {
        // Validate required fields
        if (!identifier || !oldPassword || !newPassword) {
            throw new ApiError(400, "All fields are required.");
        }

        let user = await Customer.findOne({
            $or: [{ email: identifier }, { mobileNumber: identifier }],
        });

        // If not found in Customer model, check in User model
        if (!user) {
            user = await User.findOne({
                $or: [{ email: identifier }, { mobileNumber: identifier }],
            });
        }

        // If user is not found in either model
        if (!user) {
            throw new ApiError(404, "User not found with the provided identifier.");
        }

        // Validate old password
        const isPasswordCorrect = await user.validatePassword(oldPassword);
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Incorrect old password. Please try again.");
        }

        // Hash and update the new password
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;

        await user.save();

        res.status(200).json(new ApiResponse(200, {}, "Password updated successfully."));
    } catch (err) {
        next(err);
    }
});


// Reset password for User or Customer
profileRouter.patch("/password/reset", async (req, res, next) => {
    const { mobileNumber, name, newPassword } = req.body;

    try {
        // Validate required fields
        if (!mobileNumber || !name || !newPassword) {
            throw new ApiError(400, "Please provide mobileNumber, name, and new password.");
        }

        // Find the user in Customer model first
        let user = await Customer.findOne({ mobileNumber });

        // If not found in Customer, search in User model
        if (!user) {
            user = await User.findOne({ mobileNumber });
        }

        // If user is not found in either model
        if (!user) {
            throw new ApiError(404, "User not found. Please provide correct details.");
        }

        // Verify the name matches
        if (user.name !== name) {
            throw new ApiError(404, "User not found. Please provide correct details.");
        }

        // Hash and update the new password
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;

        await user.save();

        res.status(200).json(new ApiResponse(200, {}, "Password reset successful."));
    } catch (err) {
        next(err);
    }
});

// Get all customer by Administration 
profileRouter.get("/customer/feed", authenticateUser, async(req,res,next)=>{
    try {
        // Fetch all customers and exclude the password field
        const allCustomers = await Customer.find({}).select("-password");

        res.status(200).json(new ApiResponse(200, allCustomers, "Fetched all customers data successfully."));
    } catch (err) {
        next(err);
    }
});

// Get all user by Administration 
profileRouter.get("/user/feed", authenticateUser, async(req,res,next)=>{
    const { token } = req.cookies;
    try {
        // Fetch all customers and exclude the password field
        const allUsers = await User.find({}).select("-password");

        res.status(200).json(new ApiResponse(200, allUsers, "Fetched all users data successfully."));
    } catch (err) {
        next(err);
    }
});




module.exports = profileRouter;