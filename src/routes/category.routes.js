const express = require("express");
const Category = require("../models/Category.model");
const { authenticateUser } = require("../middlewares/auth.middleware");
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

categoryRouter.get("/category/all", authenticateUser, async (req, res, next) => {

    try {
        const category = await Category.find();
        res.status(200).json(new ApiResponse(200, category, "All categories fetched successfully."));
    } catch (err) {
        next(err);
    }
});


categoryRouter.patch("/category/:categoryName/add-subcategory", authenticateUser, async (req, res, next) => {
    const { categoryName } = req.params;
    const { subcategoryName } = req.body;

    try {
        // Validate input
        if (!subcategoryName) {
            throw new ApiError(400, "Subcategory name is required.");
        }

        // Find the category by name
        const category = await Category.findOne({ name:categoryName });
        if (!category) {
            throw new ApiError(404, "Category not found.");
        }

        // Check if the subcategory already exists in the category
        if (category.subcategories.includes(subcategoryName.toLowerCase().trim())) {
            throw new ApiError(409, "Subcategory already exists in this category.");
        }

        // Add the subcategory
        category.subcategories.push(subcategoryName.toLowerCase().trim());

        // Save the updated category
        await category.save();

        res.status(200).json(
            new ApiResponse(200, category, "Subcategory added successfully.")
        );
    } catch (err) {
        next(err);
    }
});

module.exports = categoryRouter;
