const express = require("express");
const profileRouter = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");


//get user full profile get
profileRouter.get("/profile", async (req, res) => {
    const { token } = req.cookies;
    
    try {
        const decodedMessage = jwt.verify(token, "MybestFriend123123@");
        const userId = decodedMessage._id;
        const user = await User.findOne({ _id: userId });
        res.send(user)
        res.status(200).json(new ApiResponse(200, user, "User find successfully."));
    } catch (err) {
        res.status(400).send("Error : " + err);
    }
});


// search a user by email or mobile number
profileRouter.get("/user", async (req, res)=>{
    //take emails or mobile no fron req.body
    const { identifier } = req.body;

    try {
        if (!identifier?.trim()) {
            throw new ApiError(400, "Please insert Email or Mobile Number")
        };

        const user = await User.findOne({
            $or: [{ email: identifier }, { mobileNumber: identifier }]
        }).select("-password");

        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        res.status(200).json(new ApiResponse(200, user, "User find successfully."));

    } catch (err) {
        res.status(400).send("Error : " + err);
    };

});


// update user patch "/user/update" (login require) get details from cookies, if userType = customer then search in customer and if others search in users

// chande password of user patch "/user/password/change"  Take email or mobileNumber, old password, new password from body


// chande password of customer "/customer/password/change"  Take email or mobileNumber, old password, new password from body


// reset password of user "/user/password/reset"   Take email or mobile number, name, new password from body


// reset password of customer /customer/password/reset"   Take email or mobile number, name, new password from body


module.exports = profileRouter;