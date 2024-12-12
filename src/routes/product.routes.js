const express = require("express");
const Product = require("../models/Product.model");
const Brand = require("../models/Brand.model");
const Category = require("../models/Category.model");
const { authenticateUser } = require("../middlewares/auth.middleware");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const productRouter = express.Router();

productRouter.post("/product/create", authenticateUser, async (req, res, next) => {
    const {
        productName,
        brand,
        category,
        subcategory,
        purchasePrice,
        salePrice,
        mrp,
        unit,
        openingStock,
        lowLevelLimit,
        description,
        warranty,
        location,
    } = req.body;

    try {
        // Validate input
        if (!productName || !brand || !category || !purchasePrice || !salePrice || !unit) {
            throw new ApiError(
                400,
                "Product name, brand, category, purchase price, sale price, and unit are required."
            );
        }

        // Ensure brand exists or create a new brand
        let existingBrand = await Brand.findOne({ brandName: brand.trim() });
        if (!existingBrand) {
            existingBrand = new Brand({ brandName: brand.trim() });
            await existingBrand.save();
        }

        // Ensure category and subcategory exist or create them
        let existingCategory = await Category.findOne({ categoryName: category.trim().toLowerCase() });
        if (!existingCategory) {
            existingCategory = new Category({
                categoryName: category.trim().toLowerCase(),
                subcategories: subcategory ? [subcategory.trim()] : [],
            });
            await existingCategory.save();
        } else if (subcategory) {
            // Add subcategory if not already present
            if (!existingCategory.subcategories.includes(subcategory.trim())) {
                existingCategory.subcategories.push(subcategory.trim());
                await existingCategory.save();
            }
        }

        // Ensure product name is unique
        const existingProduct = await Product.findOne({ productName: productName.trim().toLowerCase() });
        if (existingProduct) {
            throw new ApiError(400, "A product with the same name already exists.");
        }

        // Create the new product
        const product = new Product({
            productName: productName.trim().toLowerCase(),
            brand: existingBrand._id,
            category: existingCategory._id,
            subcategory: subcategory ? subcategory.trim() : undefined,
            purchasePrice,
            salePrice,
            mrp,
            unit,
            stockQuantity: openingStock || 0,
            lowLevelLimit: lowLevelLimit || undefined,
            description: description || undefined,
            warranty: warranty || undefined,
            location: location || undefined,
        });

        await product.save();

        res.status(201).json(new ApiResponse(201, product, "Product created successfully."));
    } catch (err) {
        next(err);
    }
});

module.exports = productRouter;
