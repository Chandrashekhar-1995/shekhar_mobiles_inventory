const express = require("express");
const { authenticateUser } = require("../middlewares/auth.middleware");
const Category = require("../models/Category.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const categoryRouter = express.Router();

// Create a new category
categoryRouter.post("/category/create", authenticateUser, async (req, res, next) => {
    const { categoryName, subcategories } = req.body;

    try {
        // Validate input
        if (!categoryName) {
            throw new ApiError(400, "Category name is required.");
        }

        // Check if the category already exists
        const existingCategory = await Category.findOne({ categoryName });
        if (existingCategory) {
            throw new ApiError(409, "Category already exists.");
        }

        // Create the new category
        const category = new Category({
            categoryName,
            subcategories: subcategories || [], // Add subcategories if provided
        });

        await category.save();

        res.status(201).json(new ApiResponse(201, category, "Category created successfully."));
    } catch (err) {
        next(err);
    }
});

module.exports = categoryRouter;
