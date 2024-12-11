const express = require("express");
const authRouter = express.Router();
const User = require("../models/user.model");
const Customer = require("../models/customer.model");
const {validateSignupData} = require("../middlewares/auth.middleware");
const findUserOrCustomer = require('../utils/dbHelpers');
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");


// Register a Customer
authRouter.post("/auth/register", async (req, res, next) => {
    const { name, email, mobileNumber, address, password } = req.body;

    try {
        // Validate input
        validateSignupData(req);

        // Check for duplicate email or mobile number
    const existingUser = await findUserOrCustomer(email) || await findUserOrCustomer(mobileNumber);
    if (existingUser) {
      return res.status(400).json({ message: 'Email or mobile number already exists.' });
    }


        // Create new customer
        const customer = new Customer({
            name,
            email,
            mobileNumber,
            address,
            password
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


// Register admin
authRouter.post("/auth/ManojChandraAjay@hgtfrgerj/jhds/jhgecfhgd/hjgef/vgd/hgfvedhv/ghdsv/gvsdgvedf/562134wefgr763478cvdsfcjkbhs/register-admin", async (req, res, next) => {
    const { name, email, mobileNumber, address, password } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !mobileNumber || !address || !password) {
            throw new ApiError(400, "All fields are required.");
        }

        // Check if the user already exists
        const existingUser = await findUserOrCustomer(email) || await findUserOrCustomer(mobileNumber);

        if (existingUser) {
            throw new ApiError(409, "User with this email or mobile number already exists.");
        }

        // Create the Admin user
        const adminUser = new User({
            name,
            email,
            mobileNumber,
            address,
            password,
            designation: "Admin", // Explicitly set the designation to Admin
        });

        // Save the Admin user to the database
        await adminUser.save();

        const admin = await User.findById(adminUser._id).select("-password");

        res.status(201).json(
            new ApiResponse(201, admin, "Admin registered successfully.")
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

        // Use the utility function to find user or customer
        const user = await findUserOrCustomer(identifier);

        // If user/customer is not found
        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        // Validate password using the schema method
        const isPasswordCorrect = await user.validatePassword(password);
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials.");
        }

        // Generate JWT token using the user/customer model's method
        const token = user.getJWT();

        // Determine if the entity is a User or a Customer based on the model
        const isUserType = user instanceof User;

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

