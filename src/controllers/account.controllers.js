import { Account } from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const createAccount = asyncHandler( async(req, res,next)=>{

    try {
        const { accountName, accountType, openingBalance, isActive, accountNumber, ifscCode, branch } = req.body;

            if (!accountName || !accountType) {
                throw new ApiError(400, "Name and type are required." );
            };

            //check name in database
            const existingAccount = await Account.findOne({accountName:accountName.trim().toLowerCase()});
            if(existingAccount){
                throw new ApiError(400, "Already have account with this name");
            };

            // Create the account
            const account = new Account({
                accountName,
                accountType,
                accountNumber, 
                ifscCode, 
                branch,
                isActive,
                balance: openingBalance || 0,
                createdBy:req.user._id
            });
        
            // Save to database
            await account.save();

        res.status(201).json(new ApiResponse(201, account, "Account created successfully"));
    } catch (error) {
        next(error);
    };
});


const fetchAllAccount = asyncHandler( async (req, res, next) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    try {
        const accounts = await Account.find()
        .skip(skip)
        .limit(limit);
        const total = await Account.countDocuments();

        if(accounts){
            res.status(201).json(new ApiResponse(201, { accounts, total, page, limit }, " All Account Fetched"));
        } else{
            throw new ApiError(404, "No account found")
        }
            
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!search) {
        throw new ApiError(400, "Search Query is required." );
    }
    try {
        const accounts = await Account.find({
            $or: [{ accountName: { $regex: search, $options: "i" }, }, { type:{ $regex: search, $options: "i" } }],   
            })
            .skip(skip)
            .limit(limit);
            const total = await Account.countDocuments();

            if(accounts){
                res.status(201).json(new ApiResponse(201, { accounts, total, page, limit }, " All Account Fetched"));
            } else{
                throw new ApiError(404, "No account found")
            }

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