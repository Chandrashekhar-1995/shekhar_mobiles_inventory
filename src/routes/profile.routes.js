const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const fs = require("fs");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");
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


// Create User by Admin
profileRouter.post("/auth/user/create", authenticateUser, authorizeRoles("Admin"), async (req, res, next) => {

    const { 
        name, email, mobileNumber, contactNumber,address, avatar, city, state, pinCode, country, gender, dateOfBirth, marrigeAniversary, bio, joiningDate, refferedBy, designation, 
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
            throw new ApiError( 409, "A user with this email or mobile number already exists." );
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

// Create Customer by users
profileRouter.post("/auth/customer/create", authenticateUser, async (req, res, next) => {
    const {
        avatar,
        name,
        address,
        city,
        state,
        pinCode,
        country,
        email,
        contactNumber, 
        mobileNumber,
        panNo,
        gstin,
        gstType,
        tradeName,
        accountType,
        openingBalance,
        documentType,
        documentNo,
        gender,
        refferedBy,
        designation,
        dateOfBirth,
        marrigeAniversary,
        creditAllowed,
        creditLimit,
        remark,
        bio,
    } = req.body;

    try {
        // Validate required fields
        if (!name?.trim() || !mobileNumber?.trim() || !address?.trim()) {
            throw new ApiError(400, "All fields are required: name, mobileNumber, and address.");
        }

        // Check if the identifier (email or mobileNumber) already exists in the Customer model
        const existingCustomer = await Customer.findOne({mobileNumber});

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
            throw new ApiError( 409, "A user with this email or mobile number already exists." );
        };

        // Generate a default password and hash it
        const password = "ShekharMobiles9@";
        const hashPassword = await bcrypt.hash(password, 10);

        // Create a new customer
        const customer = new Customer({
            name,
            email,
            mobileNumber,
            contactNumber,
            address,
            password: hashPassword,
            avatar,
            city,
            state,
            pinCode,
            country,
            gender,
            dateOfBirth,
            marrigeAniversary,
            bio,
            remark,
            panNo,
            gstin,
            gstType,
            tradeName,
            accountType,
            balance: openingBalance,
            creditAllowed,
            creditLimit,
            refferedBy,
            designation,
            documentType,
            documentNo,
        });

        await customer.save();
        
        // Fetch the newly created user excluding the password
        const createdCustomer = await Customer.findById(customer._id).select("-password");

        // Respond with success
        res.status(201).json(
            new ApiResponse(201, createdCustomer, "Customer registered successfully.")
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
        // const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = newPassword;

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
profileRouter.get("/customer/bulk-upload/template", authenticateUser, async (req, res, next) => {
    try {
        const headers = [
            { field: "name", label: "Name *", required: true },
            { field: "mobileNumber", label: "Mobile Number *", required: true },
            { field: "contactNumber", label: "Other Contact No.", required: false },
            { field: "address", label: "Village *", required: true },
            { field: "city", label: "City", required: false },
            { field: "state", label: "State", required: false },
            { field: "pinCode", label: "Pin Code", required: false },
            { field: "country", label: "Country", required: false },
            { field: "email", label: "Email", required: false },
            { field: "gender", label: "Gender", required: false },
            // { field: "dateOfBirth", label: "Birthday", required: false },
            // { field: "marrigeAniversary", label: "Aniversary", required: false },
            { field: "panNo", label: "Pan No", required: false,},
            { field: "gstin", label: "GST IN", required: false },
            { field: "gstType", label: "GST Type", required: false },
            { field: "tradeName", label: "Trade Name", required: false },
            { field: "designation", label: "Designation", required: false, dropdown: ["Customer", "Supplier"] },
        ];
    
        const workbook = new ExcelJS.Workbook();
        const templateSheet = workbook.addWorksheet("Template");
        const instructionSheet = workbook.addWorksheet("Instructions");

        // Add headers to the template sheet
        const headerRow = templateSheet.addRow
        (headers.map((header) =>header.label));
        headerRow.eachCell((cell, colNumber)=>{
            const header = headers[colNumber -1];
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: header.required ? "FFA500" : "D3D3D3" },
            };
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };

            templateSheet.getColumn(colNumber).width = Math.max(15, header.label.length + 5);
        });

        templateSheet.getRow(headerRow.number).height = 40;

        // Add instructions to the second sheet
        instructionSheet.addRow(["Field Name", "Required/Optional", "Description/Example"]);
        headers.forEach((header) => {
            instructionSheet.addRow([
                header.label,
                header.required ? "Required" : "Optional",
                header.dropdown ? `Allowed values: ${header.dropdown.join(", ")}` : "Free text",
            ]);
        });
        instructionSheet.getRow(1).eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "CCCCCC" },
            };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            instructionSheet.getColumn(colNumber).width = Math.max(15, cell.model.value.length + 5);
        });
        instructionSheet.getRow(1).height = 40;

        const filePath = path.join(__dirname, "../uploads/customer-template.xlsx");
        await workbook.xlsx.writeFile(filePath);
    
        res.download(filePath, "customer-template.xlsx", (err) => {
                    if (err) next(err);
                    fs.unlinkSync(filePath);
                });
            } catch (err) {
                next(err);
            }
        });

// Bulk upload customers
profileRouter.post("/customer/bulk-upload", upload.single("file"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                throw new ApiError(400, "No file uploaded. Please upload an Excel or CSV file.");
            };

            // Parse the uploaded file
            const workbook = xlsx.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            const headerMapping = {
                "Name *": "name",
                "Mobile Number *": "mobileNumber",
                "Other Contact No.":"contactNumber",
                "Village *":"address",
                "City":"city",
                "State":"state",
                "Pin Code":"pinCode",
                "Country":"country",
                "Email":"email",
                "Gender":"gender",
                "Birthday":"dateOfBirth",
                "Aniversary":"marrigeAniversary",
                "Pan No":"panNo",
                "GST IN":"gstin",
                "GST Type":"gstType",
                "Trade Name":"tradeName",
                "Designation":"designation"
            };

            const requiredFields = ["name", "mobileNumber", "address"];
            const customers = [];
            const skippedCustomers = [];
            for (const row of data) {
                const customer = {};
                for (const [templateHeader, dbField] of Object.entries(headerMapping)) {
                    if (row[templateHeader] !== undefined && row[templateHeader] !== "") {
                        customer[dbField] = row[templateHeader]; 
                    }
                }

                const missingFields = requiredFields.filter((field) => !customer[field]);
                if (missingFields.length > 0) {
                skippedCustomers.push({ row, reason: `Missing fields: ${missingFields.join(", ")}` });
                    continue;
                }

                const existingCustomer = await Customer.findOne({
                    $or: [{ name: customer.name.trim().toLowerCase() }, { mobileNumber: customer.mobileNumber } ]
                });
                if(existingCustomer){
                    skippedCustomers.push({row, reason: "Customer already exists"});
                    continue;
                };

                customers.push({
                    ...customer,
                })
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
            if (req.file && req.file.path) fs.unlinkSync(req.file.path);
            next(err);
        }
    }
);


module.exports = profileRouter;