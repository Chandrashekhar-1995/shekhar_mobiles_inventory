import { Customer } from "../models/customer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findUserOrCustomer } from "../utils/dbHelpers.js";



// Create user by Admin
const create = asyncHandler(async (req, res, next) => {

    const { 
        name, email, mobileNumber, contactNumber,address, avatar, city, state, pinCode, country, gender, dateOfBirth, marrigeAniversary, bio, joiningDate, refferedBy, designation, 
        dapartment, emergencyContactPerson, emergencyContactNumber, bloodGroup, 
        identityDocument, documentNumber, communication, salesCommission, remark 
    } = req.body;

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
});



export {
    create,
}
