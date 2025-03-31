import { Customer } from "../models/customer.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findUserOrCustomer } from "../utils/dbHelpers.js";


// Register customer
const register = asyncHandler(async (req, res, next) => {
    const { name, email, mobileNumber, address, password } = req.body;

   // Check for duplicate email or mobile number
   const existingUser = await findUserOrCustomer(email) || await findUserOrCustomer(mobileNumber);
   if (existingUser) {
    throw new ApiError(400, "Email or mobile number already exists.")
   };

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
            )
});

// Register Admin
const registerAdmin = asyncHandler(async (req, res, next) => {
    const { name, email, mobileNumber, address, password } = req.body;

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
        designation: "admin", // Explicitly set the designation to Admin
    });

    // Save the Admin user to the database
    await adminUser.save();

    const admin = await User.findById(adminUser._id).select("-password");

    res.status(201).json(
        new ApiResponse(201, admin, "Admin registered successfully.")
    );
});


// Login
const login = asyncHandler(async (req, res, next) => {
    const { identifier, password } = req.body; // `identifier` can be email or mobile number

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
        const token = user.generateAccessToken();

        // Determine if the entity is a User or a Customer based on the model
        const isUserType = user instanceof User;

        res.cookie("token", token);
        res.status(200).json(
            new ApiResponse(200, user, `${isUserType ? "User" : "Customer"} logged in successfully.`)
        );
});


// Logout
const logout = asyncHandler(async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    })

    res.send("Logout successfully");
});



export {
    register,
    registerAdmin,
    login,
    logout
}