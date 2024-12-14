const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const { authenticateUser, authorizeRoles, authenticateLogin, CheckExistingUserOrCustomer } = require("../middlewares/auth.middleware");
const findUserOrCustomer = require('../utils/dbHelpers');
const upload = require("../middlewares/upload.middleware");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Customer = require("../models/customer.model");
const parseExcelDate = require("../utils/parseExcelDate");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");


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


// Admin updates designation and department for a user/customer
profileRouter.patch("/admin/update-designation", authenticateUser, authorizeRoles("Admin"),
    async (req, res, next) => {
        const { identifier, designation, department } = req.body;

        try {
            // Validate required fields
            if (!identifier || !designation) {
                throw new ApiError(400, "Identifier and designation are required.");
            }

            // Allowed designations and departments
            const customerAllowedDesignations = ["Customer", "Supplier"];
            const userAllowedDesignations = [
                "Relationship Manager",
                "Admin",
                "Marketing Executive",
                "Manager",
                "Accountant",
                "Clerk",
                "Peon",
                "Office Boy",
                "Receptionist",
                "Trainee",
            ];
            const allowedDepartments = [
                "Sales",
                "Marketing",
                "Finance",
                "Human Resource",
                "Administration",
                "Accounts",
            ];

            // Search for the user or customer
            const user = await findUserOrCustomer(identifier);

            // If user/customer not found, throw error
            if (!user) {
                throw new ApiError(404, "User not found.");
            }

            // Update based on model type
            if (user instanceof Customer) {
                if (!customerAllowedDesignations.includes(designation)) {
                    throw new ApiError(
                        400,
                        `Invalid designation for Customer. Allowed: ${customerAllowedDesignations.join(", ")}`
                    );
                }
                user.designation = designation; // Update designation
            } else if (user instanceof User) {
                if (!userAllowedDesignations.includes(designation)) {
                    throw new ApiError(
                        400,
                        `Invalid designation for User. Allowed: ${userAllowedDesignations.join(", ")}`
                    );
                }
                user.designation = designation; // Update designation

                // Department is optional but validated if provided
                if (department) {
                    if (!allowedDepartments.includes(department)) {
                        throw new ApiError(
                            400,
                            `Invalid department. Allowed: ${allowedDepartments.join(", ")}`
                        );
                    }
                    user.department = department; // Update department
                }
            } else {
                throw new ApiError(400, "Invalid user type.");
            }

            // Save changes to the database
            await user.save();

            // Success response
            res.status(200).json(
                new ApiResponse(
                    200,
                    user,
                    `${user.name}'s designation and department updated successfully.`
                )
            );
        } catch (err) {
            next(err);
        }
    }
);


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

// Downloak Bulk upload customers template
profileRouter.get("/user/bulk-upload/template", authenticateUser, (req, res, next) => {
    try {
        const headers = [
            "name",
            "phone", 
            "email", 
            "address", 
            "city", 
            "state", 
            "pinCode", 
            "gender", 
            "dateOfBirth", 
            "marrigeAniversary", 
            "bio", 
            "designation",
        ];
        const worksheet = xlsx.utils.json_to_sheet([]);
        xlsx.utils.sheet_add_aoa(worksheet, [headers],);
    
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "CustomerTemplate");
    
        const filePath = path.join(__dirname, "../uploads/customer-template.xlsx");
        xlsx.writeFile(workbook, filePath);
    
        res.download(filePath, "customer-template.xlsx", (err) => {
            if (err) {
                next(err);
            }

            // Delete the temporary file after download
                        fs.unlinkSync(filePath);
        });
    } catch (err) {
        next(err);
    }
});



// Bulk upload customers
profileRouter.post("/user/bulk-upload", authenticateUser, upload.single("file"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                throw new ApiError(400, "No file uploaded. Please upload an Excel or CSV file.");
            }

            // Parse the uploaded file
            const workbook = xlsx.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            const customers = [];
            const skippedCustomers = [];
            for (const row of data) {
                try {
                    const {
                        name,
                        phone,
                        email,
                        address,
                        city,
                        state,
                        pinCode,
                        gender,
                        dateOfBirth,
                        marrigeAniversary,
                        bio,
                        designation,
                    } = row;

                    if (!name || !phone || !address) {
                        skippedCustomers.push({ row, reason: "Required fields missing (name, phone, address)." });
                        continue;
                    }

                    // Parse dates and handle undefined/null values
                    const birthDay = dateOfBirth ? parseExcelDate(dateOfBirth) : null;
                    const aniversary = marrigeAniversary ? parseExcelDate(marrigeAniversary) : null;

                    // Check for duplicate entries
                    const existingCustomer = await Customer.findOne({
                        $or: [{ email: email?.trim().toLowerCase() }, { mobileNumber: phone }],
                    });

                    if (existingCustomer) {
                        skippedCustomers.push({ row, reason: "Duplicate customer (email/phone already exists)." });
                        continue;
                    }

                    customers.push({
                        name: name.trim(),
                        mobileNumber: phone,
                        email: email?.trim().toLowerCase(),
                        address: address.trim(),
                        city: city?.trim(),
                        state: state?.trim(),
                        pinCode: pinCode,
                        gender,
                        dateOfBirth: birthDay,
                        marrigeAniversary: aniversary,
                        bio,
                        designation: designation || "Customer",
                    });
                } catch (rowError) {
                    skippedCustomers.push({ row, reason: rowError.message });
                }
            }

            // Insert all valid customers into the database
            const insertedCustomers = await Customer.insertMany(customers);

            // Delete the uploaded file
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting file:", err);
            });

            res.status(201).json(
                new ApiResponse(201, { insertedCustomers, skippedCustomers }, "Customers uploaded successfully.")
            );
        } catch (err) {
            // Delete the file in case of an error
            if (req.file?.path) {
                fs.unlink(req.file.path, (fileErr) => {
                    if (fileErr) console.error("Error deleting file:", fileErr);
                });
            }
            next(err);
        }
    }
);




module.exports = profileRouter;