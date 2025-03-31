import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";


export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedError = [];
  errors.array().map((err) =>
    extractedError.push({
      [err.path]: err.msg,
    }),
  );

  throw new ApiError(422, "Recieved data is not valid", extractedError);
};




// const authenticateUser = async (req, res, next) => {
//     const { token } = req.cookies;

//     try {
//         if (!token) {
//             throw new ApiError(401, "Please log in first.");
//         }

//         const decodedData = jwt.verify(token, secretKey);
//         const user = await User.findById(decodedData._id);

//         if (!user) {
//             throw new ApiError(401, "Invalid user. Please log in again.");
//         }

//         req.user = user; // Attach user details to the request object
//         next();
//     } catch (err) {
//         next(err);
//     }
// };

// const authorizeRoles = (...roles) => {
//     return (req, res, next) => {
//         if (!req.user) {
//             throw new ApiError(401, "Authentication required.");
//         }

//         if (!roles.includes(req.user.designation)) {
//             throw new ApiError(403, "Access denied. Insufficient permissions.");
//         }

//         next();
//     };
// };

// const authenticateLogin = async(req, res, next) =>{
//     const { token } = req.cookies;

//     try {
//         // Check if token exists
//         if (!token) {
//             throw new ApiError(401, "Please log in");
//         }

//         // Verify and decode the JWT
//         const decodedToken = jwt.verify(token, secretKey);
//         const userId = decodedToken._id;

//         // Search in the Customer model first
//         let userProfile = await Customer.findById(userId).select("-password");

//         // If not found in Customer, search in User
//         if (!userProfile) {
//             userProfile = await User.findById(userId).select("-password");
//         }

//         // If not found in both, throw an error
//         if (!userProfile) {
//             throw new ApiError(404, "User not found.");
//         }

//         req.user = userProfile; // Attach user details to the request object
//         next();
//     } catch (err) {
//         next(err);
//     }
// };

// const CheckExistingUserOrCustomer = async(req, res, next)=>{

//     const { identifier } = req.body;

//     try {
//         // Validate input
//         if (!identifier?.trim()) {
//             throw new ApiError(400, "Please provide a valid Email or Mobile Number.");
//         }

//         // Search in the Customer model first
//         let user = await Customer.findOne({
//             $or: [{ email: identifier }, { mobileNumber: identifier }]
//         }).select("-password");

//         // If not found in Customer, search in User
//         if (!user) {
//             user = await User.findOne({
//                 $or: [{ email: identifier }, { mobileNumber: identifier }]
//             }).select("-password");
//         }

//         // If not found in both models, throw an error
//         if (!user) {
//             throw new ApiError(404, "User not found.");
//         };

//         req.user = user;
//         next();

//     } catch (err) {
//         next(err);
//     }
// };


// module.exports = {
//     validateSignupData,
//     authenticateUser, 
//     authorizeRoles, 
//     authenticateLogin,
//     CheckExistingUserOrCustomer
// };
