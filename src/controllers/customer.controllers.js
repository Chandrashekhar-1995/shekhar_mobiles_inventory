import bcrypt from "bcryptjs";
import { Customer } from "../models/customer.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findUserOrCustomer } from "../utils/dbHelpers.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";



// Create customer by user / admin
const createCustomer = asyncHandler(async (req, res, next) => {

    const { 
        name, mobileNumber, contactNumber, address, city, state, pinCode, country, email, avatar, gender, panNo, gstin, gstType, tradeName, dateOfBirth, marrigeAniversary, bio, remark, designation, accountType, openingBalance, creditAllowed, creditLimit, refferedBy, documentType, documentNo,
    } = req.body;

        // Validate required fields
        if (!name?.trim() || !mobileNumber || !address?.trim()) {
            throw new ApiError(400, "All fields are required: name, mobileNumber, and address.");
        }

        if(email !== undefined){
          const existingUser = await findUserOrCustomer(email)
            if (existingUser) {
              throw new ApiError(400, "Email or mobile number already exists.")
            };
        };

        const existingUser = await findUserOrCustomer(mobileNumber);
        
        if (existingUser) {
            throw new ApiError(400, "Email or mobile number already exists.")
          };

        // Generate a default password and hash it
        const password = "ShekharMobiles9@";
        const hashPassword = await bcrypt.hash(password, 10);

        // Create new user
        const customer = new Customer({
            password: hashPassword,
            name, 
            mobileNumber, 
            contactNumber, 
            address, 
            city, 
            state, 
            pinCode, 
            country, 
            email: email ? email : undefined, 
            avatar, 
            gender, 
            panNo, 
            gstin, 
            gstType, 
            tradeName, 
            dateOfBirth, 
            marrigeAniversary, 
            bio, 
            remark, 
            designation, 
            accountType, 
            balance:openingBalance, 
            creditAllowed, 
            creditLimit, 
            refferedBy, 
            documentType, 
            documentNo,
        });

        await customer.save();

        // Fetch the newly created user excluding the password
        const createdCustomer = await Customer.findById(customer._id).select("-password");

        // Respond with success
        res.status(201).json(
            new ApiResponse(201, createdCustomer, "Customer created successfully.")
        );
});

// Fetch customer by id
const fetchCustomerByID = asyncHandler( async (req, res, next) => {
  const {id} = req.params;
  try {
    const customer = await Customer.findById(id);
    res.status(200).json(new ApiResponse(200, customer, "Customers Fetched"));
    
  } catch (error) {
    next(error)
  }
});

// Search Customers by Name or Mobile number
const searchCustomers = async (req, res, next) => {
    try {
      const { search } = req.query;
  
      if (!search) {
        throw new ApiError(400, "Search Query is required." );
      }
  
      // Case-insensitive search for matching names
      const customers = await Customer.find({
        $or: [{ name: { $regex: search, $options: "i" }, }, { mobileNumber:{ $regex: search, $options: "i" } }],
        
      }).limit(20);
  
      res.status(200).json(new ApiResponse(200, customers, "Customers Fetched"));
    } catch (err) {
      next(err);;
    }
  };

// Update customer by id
const updateCustomer = asyncHandler( async (req, res, next) => {});

// Delete customer by id
const deleteCustomer = asyncHandler( async (req, res, next) => {});
  
  export { 
    createCustomer,
    fetchCustomerByID,
    searchCustomers,
    updateCustomer,
    deleteCustomer,
   }; 