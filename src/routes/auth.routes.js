const express = require("express");
const authRouter = express.Router();
const User = require("../models/user.model");
const validateSignupData = require("../middlewares/auth.middleware");
const bcrypt = require('bcrypt');
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");


// Register User
authRouter.post("/user/register", async (req, res, next) => {
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
        next(err);
     }
 });


 // Create User
 authRouter.post("/user/create", async (req, res, next) => {
    const { name, email, mobileNumber, address, avatar, city, state, pinCode, gender, dateOfBirth, marrigeAniversary, bio, joiningDate, refferedBy, designation, dapartment, emergencyContactPerson, emergencyContactNumber, bloodGroup, identityDocument, documentNumber, communication, salesCommission, remark} = req.body;

    try {
        
        // Validate required fields
    if (!name?.trim() || !mobileNumber?.trim() || !address?.trim()) {
        throw new ApiError(400, "All fields are required: name, mobileNumber, and address.");
    }

        // Check if email or mobile number already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobileNumber }] });
        if (existingUser) {
            throw new ApiError(409, "User with this email or mobile number already exists.");
        }

        // Incrypt password
        const password = "ShekharMobiles9@"
        const hashPassword = await bcrypt.hash(password, 10)

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
            remark
         });
         await user.save();

         const createdUser = await User.findById(user._id).select(
            "-password"
        );
 
         res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully."));
     } catch (err) {
        next(err);
     }
 });

 
// Login User
authRouter.get("/user/login", async (req, res, next) => {
    const { identifier, password } = req.body; // `identifier` can be mobileNumber or email
    try {
        // Check email or mobileNumber in the database
        const user = await User.findOne({
            $or: [{ email: identifier }, { mobileNumber: identifier }],
        });

        if (!user) {
            throw new ApiError(400, "User not found");
        }

        // Compare password using the schema method
        const isPasswordCorrect = await user.validatePassword(password);

        if (!isPasswordCorrect) {
            throw new ApiError(409, "invalid credentials");            
        }

        // Generate JWT token using user method
        const jwtToken = user.getJWT();

        res.cookie("token", jwtToken);
        res.status(200).json(new ApiResponse(200, {}, "Login successfully"));
    } catch (err) {
        next(err);
    }
});


// Logout
authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    })

    res.send("Logout successfully");
})

module.exports = authRouter;

