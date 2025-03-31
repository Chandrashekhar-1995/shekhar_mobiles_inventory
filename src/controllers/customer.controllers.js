import { Customer } from "../models/customer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

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
  
  
  export { searchCustomers }; 