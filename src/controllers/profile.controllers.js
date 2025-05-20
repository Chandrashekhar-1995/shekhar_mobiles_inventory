import { Customer } from "../models/customer.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findUserOrCustomerByID } from "../utils/dbHelpers.js";
import bcrypt from "bcryptjs";

// get profile
const getMyProfile = asyncHandler( async (req, res, next) => {
  try {
    const user = req.user
    res.status(200).json(
      new ApiResponse(200, user, "Profile fetched successfully"))
  } catch (error) {
    next(error)
  }
});


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


// change password
const changePassword = asyncHandler( async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const id = req.user._id;
    try {
      const user = await findUserOrCustomerByID(id);
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
          throw new ApiError(400, "incorrect Password");
      }

      user.password = newPassword;
      await user.save();
  
      res.status(200).json(
        new ApiResponse(200, user, "Password updated successfully.")
    );
    } catch (error) {
        next(error)
    }
  });


export {
    getMyProfile,
    deleteMyProfile,
    changePassword,
  }