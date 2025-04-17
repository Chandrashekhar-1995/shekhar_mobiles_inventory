import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const createCategory = asyncHandler( async (req, res, next) => {
    const { categoryName, subcategories, gstRate } = req.body;

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
            gstRate,
        });

        await category.save();

        res.status(201).json(new ApiResponse(201, category, "Category created successfully."));
    } catch (error) {
        next(error);
    }
});


const fetchAllCategory = asyncHandler( async (req, res, next) => {

    try {
        const category = await Category.find();
        res.status(200).json(new ApiResponse(200, category, "All categories fetched successfully."));
    } catch (error) {
        next(error);
    }
});


const fetchCategoryByID = asyncHandler( async (req, res, next) =>{
    const {id} = req.params;
    try {
        const category = await Category.findById(id);
        res.status(200).json(new ApiResponse(200, category, "Category Fetched"));
    } catch (error) {
        next(error);
    }
});


const searchCategory = asyncHandler( async (req, res, next) =>{
    try {
        const { search } = req.query;
        if (!search) {
                throw new ApiError(400, "Search Query is required." );
              }
        
        const categories = await Category.find({
            categoryName: { $regex: search, $options: "i" } 
        }).limit(20);

        if (!categories) {
            throw new ApiError(400, "No category found" );
          }

        res.status(200).json(new ApiResponse(200, categories, "Categories Fetched"));

    } catch (error) {
        next(error);
    }
});


const updateCategory = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find the account to update
        const category = await Category.findById(id);
          if (!category) {
              throw new ApiError(404, "Category not found, please select a correct brand");
          }

        // check updated name existing
        const existingCategory = await Category.findOne({categoryName:updateData.categoryName});
        if (existingCategory) {
            throw new ApiError(404, "Category name duplicate");
        }

        const updatedCategory = await Category.findByIdAndUpdate(
              id,
              { $set: updateData },
              { new: true, runValidators: true }
          )
        
        if (!updatedCategory) {
              throw new ApiError(500, "Failed to update category");
          }
        
        res.status(200).json(
              new ApiResponse(200, updatedCategory, "Category updated successfully")
          );
        
    } catch (error) {
        next(error);
    }
});


const deleteCategory = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
                throw new ApiError(404, "Category not found, please select a correct account");
            }
        
        res.status(200).json(
            new ApiResponse(200, null, "Category deleted.")
          );
    } catch (error) {
        next(error);
    }
});


export {
    createCategory,
    fetchAllCategory,
    fetchCategoryByID,
    searchCategory,
    updateCategory,
    deleteCategory
}