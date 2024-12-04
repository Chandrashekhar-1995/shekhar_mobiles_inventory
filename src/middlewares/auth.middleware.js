const validator = require("validator");
const ApiError = require("../utils/ApiError");

const validateSignupData = (req) => {
    const { name, email, mobileNumber, address, password } = req.body;

    // Validate required fields
    if (!name?.trim() || !mobileNumber?.trim() || !address?.trim()) {
        throw new ApiError(400, "All fields are required: name, mobileNumber, and address.");
    }

    // Validate email
    if (!email || !validator.isEmail(email)) {
        throw new ApiError(400, `Invalid email address: ${email || "Email undefined"}`);
    }

    // Validate password strength
    if (!password || !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })) {
        throw new ApiError(400, "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol.");
    }
};

const checkUserType = (userType) => {
    return (req, res, next) => {
        const userRole = req.user?.role; // Assuming role is attached to req.user
        if (!role.includes(userRole)) {
            return res.status(403).json({ error: "Access denied" });
        }
        next();
    };
};

module.exports = validateSignupData,{checkUserType};
