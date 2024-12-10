const express = require("express");
const authRouter = express.Router();
const User = require("../models/user.model");
const Customer = require("../models/customer.model");
const {validateSignupData} = require("../middlewares/auth.middleware");
const bcrypt = require('bcrypt');
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");


// Register User
authRouter.post("/auth/register", async (req, res, next) => {
    try {
        // Validate input
        validateSignupData(req);

        const { name, email, mobileNumber, address, password } = req.body;

        // Check if email or mobile number already exists in the Customer model
        const existingCustomer = await Customer.findOne({
            $or: [{ email }, { mobileNumber }],
        });

        if (existingCustomer) {
            throw new ApiError(
                409,
                "Customer with this email or mobile number already exists."
            );
        }

        // Check if email or mobile number already exists in the User model
        const existingUser = await User.findOne({
            $or: [{ email }, { mobileNumber }],
        });

        if (existingUser) {
            throw new ApiError(
                409,
                "User with this email or mobile number already exists."
            );
        }

        // Encrypt password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create new customer
        const customer = new Customer({
            name,
            email,
            mobileNumber,
            address,
            password: hashPassword,
        });
        await customer.save();

        const createdCustomer = await Customer.findById(customer._id).select(
            "-password"
        );

        res.status(201).json(
            new ApiResponse(
                201,
                createdCustomer,
                "Customer registered successfully."
            )
        );
    } catch (err) {
        next(err);
    }
});

 
// Login User
authRouter.post("/auth/login", async (req, res, next) => {
    const { identifier, password } = req.body; // `identifier` can be email or mobile number

    try {
        if (!identifier || !password) {
            throw new ApiError(400, "All fields are required.");
        }

        let user = await User.findOne({
            $or: [{ email: identifier }, { mobileNumber: identifier }],
        });

        let isUserType = true; // To track if found in User model

        // If not found in the User model, search in the Customer model
        if (!user) {
            user = await Customer.findOne({
                $or: [{ email: identifier }, { mobileNumber: identifier }],
            });
            isUserType = false; // Mark as Customer
        }

        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        // Validate password using the schema method
        const isPasswordCorrect = await user.validatePassword(password);
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials.");
        }

        // Generate JWT token using the user model's method
        const token = user.getJWT();

        res.cookie("token", token);
        res.status(200).json(
            new ApiResponse(200, {}, `${isUserType ? "User" : "Customer"} logged in successfully.`)
        );
    } catch (err) {
        next(err);
    }
});


// Logout
authRouter.post("/auth/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    })

    res.send("Logout successfully");
})

module.exports = authRouter;

