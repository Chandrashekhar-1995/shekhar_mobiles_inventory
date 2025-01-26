const Customer = require("../models/customer.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// Search Customers by Name
const searchCustomers = async (req, res) => {
    try {
      const { search } = req.query;
  
      if (!search) {
        throw new ApiError(400, "Search Query is required." );
      }
  
      // Case-insensitive search for matching names
      const customers = await Customer.find({
        $or: [{ name: { $regex: search, $options: "i" }, }, { mobileNumber:{ $regex: search, $options: "i" } }],
        
      }).limit(10);
  
      res.status(200).json(new ApiResponse(200, customers, "Customer Fetched"));
    } catch (err) {
      next(err);;
    }
  };
  
  module.exports = { searchCustomers }; 