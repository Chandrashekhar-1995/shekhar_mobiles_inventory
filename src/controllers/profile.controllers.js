import { Customer } from "../models/customer.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findUserOrCustomer } from "../utils/dbHelpers.js";


// Delete my profile
const deleteMyProfile = asyncHandler( async (req, res, next) => {
    const userId = req.user._id;
    try {
      const deletedUser = await Customer.findByIdAndDelete(id) || await User.findByIdAndDelete(id);
  
      if (!deletedUser) {
          throw new ApiError(404, "Profile not found");
      }
  
      res.status(200).json(
        new ApiResponse(200, null, "Profile deleted.")
    );
    } catch (error) {
        next(error)
    }
  });

export {
    deleteMyProfile,
  }