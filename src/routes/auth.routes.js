const express = require("express");
const authRouter = express.Router();
const User = require("../models/user.model");
const validateSignupData = require("../middlewares/auth");
const bcrypt = require('bcryptjs');
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const userRouter = express.Router();

// Register User
authRouter.post("/register", async (req, res, next) => {
    try {
        // Validate input
        validateSignupData(req);

        const { name, email, mobileNumber, address, password, } = req.body;

        // Check if email or mobile number already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (existingUser) {
            throw new ApiError(409, "User with this email or mobile number already exists.");
        }

        // Incrypt password
        const hashPassword = await bcrypt.hash(password, 10)

         // Create new user
         const user = new User({
            name, 
            email, 
            mobileNumber, 
            address, 
            password: hashPassword });
         await user.save();

         const createdUser = await User.findById(user._id).select(
            "-password"
        );
 
         res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully."));
     } catch (err) {
         next(err); // Forward error to centralized error handler
     }
 });


 
 module.exports = userRouter;
