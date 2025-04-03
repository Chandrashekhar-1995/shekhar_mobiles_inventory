import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { Customer } from "../models/customer.model.js";
import { User } from "../models/user.model.js";

const isLoggedIn = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    try {
        if (!accessToken) {
            if (!refreshToken) {
                throw new ApiError(401, "Please login to continue");
            }

            // Verify Refresh Token
            const refreshDecodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            
            // Check both User and Customer models
            const user = await User.findById(refreshDecodedToken._id) || 
                         await Customer.findById(refreshDecodedToken._id);

            if (!user || user.refreshToken !== refreshToken) {
                res.clearCookie("accessToken");
                res.clearCookie("refreshToken");
                throw new ApiError(401, "Invalid session, please login again");
            }

            // Generate new tokens
            const newAccessToken = user.generateAccessToken();
            const newRefreshToken = user.generateRefreshToken();

            user.refreshToken = newRefreshToken;
            await user.save();

            // Set secure cookies
            res.cookie("accessToken", newAccessToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            res.cookie("refreshToken", newRefreshToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            req.user = user;
            return next();
        }

        // Verify access token
        try {
            const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken._id) || 
                         await Customer.findById(decodedToken._id);

            if (!user) {
                throw new ApiError(401, "User not found, please login again.");
            }

            // Generate new tokens
            const newAccessToken = user.generateAccessToken();
            const newRefreshToken = user.generateRefreshToken();

            user.refreshToken = newRefreshToken;
            await user.save();

            // Set secure cookies
            res.cookie("accessToken", newAccessToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            res.cookie("refreshToken", newRefreshToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            req.user = user;
            return next();
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                if (!refreshToken) {
                    throw new ApiError(401, "Session expired, please login again.");
                }

                const refreshDecodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                const user = await User.findById(refreshDecodedToken._id) || 
                             await Customer.findById(refreshDecodedToken._id);

                if (!user || user.refreshToken !== refreshToken) {
                    res.clearCookie("accessToken");
                    res.clearCookie("refreshToken");
                    throw new ApiError(401, "Invalid session, please login again.");
                }

                // Generate new tokens
                const newAccessToken = user.generateAccessToken();
                const newRefreshToken = user.generateRefreshToken();

                user.refreshToken = newRefreshToken;
                await user.save();

                // Set secure cookies
                res.cookie("accessToken", newAccessToken, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 15 * 60 * 1000 // 15 minutes
                });
                res.cookie("refreshToken", newRefreshToken, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });

            req.user = user;
            return next();
            } else {
                throw new ApiError(401, "Invalid token, please login again.");
            }
        }
    } catch (err) {
        next(err);
    }
};


const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized: Please login first");
        }

        // Find the user in User 
        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ApiError(404, "Unauthorized: Access denied");
        }

        // Check if user is admin
        if (user.designation !== "admin") {
            throw new ApiError(403, "Forbidden: Admin access required");
        }

        // Attach full user object to request if needed
        req.adminUser = user;
        next();
    } catch (error) {
        next(error);
    }
};

const isUser = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized: Please login first");
        }

        // Find the user in User 
        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ApiError(404, "Unauthorized: Access denied");
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};


const roleBasedAuth = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new ApiError(401, "Unauthorized: Please login first");
            }

            const user = await User.findById(req.user._id) || 
                         await Customer.findById(req.user._id);

            if (!user) {
                throw new ApiError(404, "User not found. Please login first");
            }

            if (!allowedRoles.includes(user.designation)) {
                throw new ApiError(403, "Access denied"
                    // `Forbidden: Required roles - ${allowedRoles.join(", ")}`
                );
            }

            req.user = user;
            next();
        } catch (error) {
            next(error);
        }
    };
};



export {
    isLoggedIn,
    isAdmin,
    isUser,
    roleBasedAuth,
};