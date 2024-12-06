const express = require("express");
const profileRouter = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");


//user full profile get "/profile" get details from cookies if userType = customer then search in customer others search in users (login require)
profileRouter.get("/profile", async (req, res) => {
    const { token } = req.cookies;
    
    try {
        const decodedMessage = jwt.verify(token, "MybestFriend123123@");
        const userId = decodedMessage._id;
        const user = await User.findOne({ _id: userId });
        res.send(user)
    } catch (err) {
        res.send("Please login again!!     Error: " + err);
    }
});


// search a user by email or mobile number get "/user" take emails or mobile no fron req.body(no need login)


// update user patch "/user/update" (login require) get details from cookies, if userType = customer then search in customer and if others search in users

// chande password of user patch "/user/password/change"  Take email or mobileNumber, old password, new password from body


// chande password of customer "/customer/password/change"  Take email or mobileNumber, old password, new password from body


// reset password of user "/user/password/reset"   Take email or mobile number, name, new password from body


// reset password of customer /customer/password/reset"   Take email or mobile number, name, new password from body


module.exports = profileRouter;