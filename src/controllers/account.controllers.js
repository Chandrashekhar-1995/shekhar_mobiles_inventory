import { Account } from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const createAccount = asyncHandler( async(req, res,next)=>{

    try {
        const { name, type, balance, status, accountNumber, ifscCode, branch } = req.body;

            if (!name || !type) {
                throw new ApiError(400, "Name and type are required." );
            };
        

            // Validate type
            const validTypes = ["cash", "qr_code", "razorpay", "bank"];
            if (!validTypes.includes(type)) {
                throw new ApiError(400, `Invalid account type. Must be one of ${validTypes.join(", ")}.`)
            };

            //check name in database
            const existingAccount = await Account.findOne({accountName:name.trim().toLowerCase()});
            if(existingAccount){
                throw new ApiError(400, "Already have account with this name");
            };


            // Validate status
            const validStatuses = ["active", "in_active"];
            if (status && !validStatuses.includes(status)) {
                throw new ApiError(400, `Invalid status. Must be one of ${validStatuses.join(", ")}.`)};
        
            // Set default status if not provided
            const accountStatus = status || "Active";
        
            // Create the account
            const account = new Account({
                accountName:name,
                type,
                accountNumber, 
                ifscCode, 
                branch,
                balance: balance || 0, // Default balance to 0 if not provided
                status: accountStatus,
            });
        
            // Save to database
            await account.save();

        res.status(201).json(new ApiResponse(201, account, "Account created successfully"));
    } catch (error) {
        next(error);
    };
});


const fetchAllAccount = asyncHandler( async (req, res, next) =>{
    try {
        const allAccounts = await Account.find();
        res.status(201).json(new ApiResponse(201, allAccounts, " All Account Fetched"));

    } catch (error) {
        next(error);
    }
});


const fetchAccountByID = asyncHandler( async (req, res, next) =>{
    const {id} = req.params;
    try {
        const account = await Account.findById(id);
        res.status(200).json(new ApiResponse(200, account, "Account Fetched"));
    } catch (error) {
        next(error);
    }
});


const searchAccount = asyncHandler( async (req, res, next) =>{
    try {
        const { search } = req.query;
        if (!search) {
                throw new ApiError(400, "Search Query is required." );
              }
        
        const accounts = await Account.find({
                $or: [{ accountName: { $regex: search, $options: "i" }, }, { type:{ $regex: search, $options: "i" } }],
                
              }).limit(20);

        res.status(200).json(new ApiResponse(200, accounts, "Accounts Fetched"));

    } catch (error) {
        next(error);
    }
});


const updateAccount = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find the account to update
        const account = await Account.findById(id);
          if (!account) {
              throw new ApiError(404, "Account not found, please select a correct account");
          }
        
        const updatedAccount = await Account.findByIdAndUpdate(
              id,
              { $set: updateData },
              { new: true, runValidators: true }
          )
        
        if (!updatedAccount) {
              throw new ApiError(500, "Failed to update account");
          }
        
        res.status(200).json(
              new ApiResponse(200, updatedAccount, "Account updated successfully")
          );
        
    } catch (error) {
        next(error);
    }
});


const deleteAccount = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;

        const deletedAccount = await Account.findByIdAndDelete(id);

        if (!deletedAccount) {
                throw new ApiError(404, "Account not found, please select a correct account");
            }
        
        res.status(200).json(
            new ApiResponse(200, null, "Account deleted successfully")
          );
    } catch (error) {
        next(error);
    }
});




export {
    createAccount,
    fetchAllAccount,
    fetchAccountByID,
    searchAccount,
    updateAccount,
    deleteAccount
}