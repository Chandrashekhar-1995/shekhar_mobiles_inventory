import { Customer } from "../models/customer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findUserOrCustomer } from "../utils/dbHelpers.js";



// Create user by Admin
const register = asyncHandler(async (req, res, next) => {
    const { name, email, mobileNumber, address, password } = req.body;
    console.log(req.body);
    
    //TODO validate data

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



export {
    register,
}
