const express = require("express");
const { authenticateUser } = require("../middlewares/auth.middleware");
const Account = require("../models/account.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const accountRouter = express.Router();


// create account
accountRouter.post("/account/create",authenticateUser, async(req, res,next)=>{

    try {
        const { name, type, balance, status, accountNumber, ifscCode, branch } = req.body;

            if (!name || !type) {
                throw new ApiError(400, "Name and type are required." );
            };
        

            // Validate type
            const validTypes = ["Cash", "QR Code", "Razorpay", "Bank"];
            if (!validTypes.includes(type)) {
                throw new ApiError(400, `Invalid account type. Must be one of ${validTypes.join(", ")}.`)
            };

            //check name in database
            const existingAccount = await Account.findOne({accountName:name.trim().toLowerCase()});
            if(existingAccount){
                throw new ApiError(400, "Already have account with this name");
            };


            // Validate status
            const validStatuses = ["Active", "Inactive"];
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
    } catch (err) {
        next(err);
    };
} );


module.exports = accountRouter;
