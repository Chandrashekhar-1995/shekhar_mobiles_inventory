const express = require("express");
const Brand = require("../models/Brand.model");
const { authenticateUser } = require("../middlewares/auth.middleware");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const brandRouter = express.Router();

brandRouter.post("/brand/create", authenticateUser, async (req, res, next) => {
    const { brandName } = req.body;

    try {
        if (!brandName) {
            throw new ApiError(400, "Brand name is required.");
        }

        // Check if the brand already exists
        const existingBrand = await Brand.findOne({ brandName });
        if (existingBrand) {
            throw new ApiError(409, "Brand already exists.");
        }

        // Create the brand
        const brand = await Brand.create({ brandName });

        res.status(201).json(new ApiResponse(201, brand, "Brand created successfully."));
    } catch (err) {
        next(err);
    }
});

module.exports = brandRouter;
