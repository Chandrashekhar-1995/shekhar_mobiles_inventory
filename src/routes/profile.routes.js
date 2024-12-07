const express = require("express");
const profileRouter = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");


//get user full profile get
profileRouter.get("/profile", async (req, res, next) => {
    const { token } = req.cookies;
    
    try {
        if(!token){
            throw new ApiError(400, "Login first ")
        };

        const decodedMessage = jwt.verify(token, "MybestFriend123123@");
        const userId = decodedMessage._id;
        const user = await User.findOne({ _id: userId });
        res.send(user)
        res.status(200).json(new ApiResponse(200, user, "User detail fetched successfully."));
    } catch (err) {
        next(err);
    }
});


// search a user by email or mobile number
profileRouter.get("/user", async (req, res, next)=>{
    //take emails or mobile no fron req.body
    const { identifier } = req.body;

    try {
        if (!identifier?.trim()) {
            throw new ApiError(400, "Please insert Email or Mobile Number")
        };

        const user = await User.findOne({
            $or: [{ email: identifier }, { mobileNumber: identifier }]
        }).select("-password");

        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        res.status(200).json(new ApiResponse(200, user, "User find successfully."));

    } catch (err) {
        next(err);
    };

});


// update login user details
profileRouter.patch("/user/update", async(req,res, next)=>{
    const data = req.body;
    const { token } = req.cookies;

    try {
        // check update only if login done
        if(!token){
            throw new ApiError(401, "Please log in first.")
        };

        const UPDATE_ALLOWED = ["name", "email", "mobileNumber", "address", "avatar", "city", "state", "pinCode", "gender", "dateOfBirth", "marrigeAniversary", "bio", "emergencyContactPerson", "emergencyContactNumber", "bloodGroup", "communication", "remark"];

        const updateFields = Object.keys(data);
        const invalidFields = updateFields.filter((key) => !UPDATE_ALLOWED.includes(key));

        if (invalidFields.length > 0) {
            throw new ApiError(403, `Updating these fields is not allowed: ${invalidFields.join(", ")}`);
        };

        // Find Update the user
        const userId = jwt.verify(token, "MybestFriend123123@");
        const user = await User.findByIdAndUpdate(
            userId, 
            data, 
            { returnDocument: 'after', runValidators: true }
        ); 

        if (!user) {
            throw new ApiError(404, "User not found");
        };

        res.status(200).json(new ApiResponse(200, `Hey ${user.name} your profile updated successfully.`));
        
    } catch (err) {
        next(err);
    }
});

// update user details by Admin
profileRouter.patch("/admin/update/user", async(req,res, next)=>{
    const {userId, ...data} = req.body;
    const { token } = req.cookies;

    try {
        // check update only if login done
        if(!token){
            throw new ApiError(401, "Please log in first.")
        };

        // Verify the admin's token
        const adminData = jwt.verify(token, "MybestFriend123123@");
        const adminUser = await User.findById(adminData._id);

        if(!adminUser){
            throw new ApiError(404, "Admin not found.");
        };

         // Check if the logged-in user is an Admin
         if(adminUser.designation !== "Admin"){
            throw new ApiError(403, "Access denied. Only Admins can update user details.");
         };

        // Validate user ID and updates
        if(!userId || !data ){
            throw new ApiError(400, "Please provide a valid userId and updates.")
        };
        
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            {$set: data}, 
            { new: true, runValidators: true }
        ); 

        if (!updatedUser){
            throw new ApiError(404, "User not found");
        };

        

        res.status(200).json(new ApiResponse(200, updatedUser, `${updatedUser.name}'s profile updated successfully.`));
        
    } catch (err) {
        next(err);
    }
});

// chande password of user patch "/user/password/change"  Take email or mobileNumber, old password, new password from body


// chande password of customer "/customer/password/change"  Take email or mobileNumber, old password, new password from body


// reset password of user "/user/password/reset"   Take email or mobile number, name, new password from body


// reset password of customer /customer/password/reset"   Take email or mobile number, name, new password from body


module.exports = profileRouter;