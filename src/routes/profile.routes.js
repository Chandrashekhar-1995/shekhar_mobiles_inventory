const express = require("express");
const profileRouter = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");


// Get full profile (User or Customer)
profileRouter.get("/profile", async (req, res, next) => {
    const { token } = req.cookies;

    try {
        // Check if token exists
        if (!token) {
            throw new ApiError(401, "Please log in first.");
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

        // Respond with the profile details
        res.status(200).json(new ApiResponse(200, userProfile, "Profile fetched successfully."));
    } catch (err) {
        next(err);
    }
});

// Search a user by email or mobile number (in Customer or User model)
profileRouter.get("/user", async (req, res, next) => {
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
        }

        // Respond with the user details
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
        const decodedMessage = jwt.verify(token, "MybestFriend123123@");
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
profileRouter.patch("/admin/update/user", async (req, res, next) => {
    const { userId, ...data } = req.body;
    const { token } = req.cookies;

    try {
        // Ensure login and token validation
        if (!token) {
            throw new ApiError(401, "Please log in first.");
        }

        // Decode token and verify the admin's identity
        const decodedData = jwt.verify(token, "MybestFriend123123@");
        const adminUser = await User.findById(decodedData._id);

        if (!adminUser) {
            throw new ApiError(404, "Admin not found.");
        }

        // Check if the logged-in user has the Admin designation
        if (adminUser.designation !== "Admin") {
            throw new ApiError(403, "Access denied. Only Admins can update user details.");
        }

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


// chande password of user
profileRouter.patch("/user/password/change", async (req,res,next)=>{
    // Take email or mobileNumber, old password, new password from body
    const {identifier, oldPassword, newPassword} = req.body

    try {
        const user = await User.findOne({
            $or: [{ email: identifier }, { mobileNumber: identifier }]
        })

        if(!user){
            throw new ApiError(404, "User not found with this email")
        };

        const isPasswordCorrect = await user.validatePassword(oldPassword);
        if(!isPasswordCorrect){
            throw new ApiError(401, "Wrong Old password please insert correct password")
        };

        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;

        await user.save();

        res.status(200).json(new ApiResponse(200,{}, "Password updated successfully"));
        
    } catch (err) {
        next(err);
    }

});

// reset password of user
profileRouter.patch("/user/password/reset", async (req,res,next)=>{
    // Take mobile number, name, new password from body
    const {mobileNumber, name, newPassword} = req.body;

    try {
        const user = await User.findOne({ mobileNumber: mobileNumber })

        if(!user){
            throw new ApiError(404, "User not found Please insert correct details")
        };

        if(user.name !== name){
            throw new ApiError(404, "User not found Please insert correct details")
        };

        const hashPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashPassword;

        await user.save();

        res.status(200).json(new ApiResponse(200,{}, "Password reset successfull"));
        
    } catch (err) {
        next(err);
    };
});



module.exports = profileRouter;