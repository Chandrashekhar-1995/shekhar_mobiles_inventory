const express = require("express");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product.model");
const Brand = require("../models/Brand.model");
const Category = require("../models/Category.model");
const { authenticateUser } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
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



// API to download product upload template
productRouter.get("/product/template", authenticateUser, async (req, res, next) => {
    try {
        // Define headers for the CSV/Excel template
        const headers = [
            "productName",     // Required
            "itemCode",        // Optional
            "brand",           // Required
            "category",        // Required
            "subcategory",     // Optional
            "purchasePrice",   // Required
            "salePrice",       // Required
            "minSalePrice",    // Optional
            "mrp",             // Optional
            "unit",            // Required: UNT, PCS, NOS, MTR, BOX
            "saleDiscount",    // Optional
            "lowLevelLimit",   // Optional
            "description",     // Optional
            "warranty",        // Optional
            "location",        // Optional
            "openingStock",    // Optional
        ];

        // Create a worksheet and workbook
        const worksheet = xlsx.utils.json_to_sheet([]);
        xlsx.utils.sheet_add_aoa(worksheet, [headers]);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Template");

        // Write the file to disk temporarily
        const filePath = path.join(__dirname, "../uploads/product-template.xlsx");
        xlsx.writeFile(workbook, filePath);

        // Send the file as a response
        res.download(filePath, "product-template.xlsx", (err) => {
            if (err) {
                next(err);
            }

            // Delete the temporary file after download
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        next(err);
    }
});



// Bulk upload API
productRouter.post("/product/bulk-upload", authenticateUser, upload.single("file"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                throw new ApiError(400, "No file uploaded. Please upload an Excel or CSV file.");
            }

            // Parse the uploaded file
            const workbook = xlsx.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // Validate and process each row
            const products = [];
            const skippedProducts = [];
            for (const row of data) {
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
                } = row;

                if (!productName || !brand || !category || !purchasePrice || !salePrice || !unit) {
                    skippedProducts.push({
                        row,
                        reason: "Missing required fields",
                    });
                    continue; // Skip rows with missing required fields
                }

                // Check if the product already exists
                const existingProduct = await Product.findOne({
                    productName: productName.trim().toLowerCase(),
                });
                if (existingProduct) {
                    skippedProducts.push({
                        row,
                        reason: "Product already exists",
                    });
                    continue; // Skip duplicate products
                }

                // Ensure brand exists or create it
                let existingBrand = await Brand.findOne({ brandName: brand.trim() });
                if (!existingBrand) {
                    existingBrand = new Brand({ brandName: brand.trim() });
                    await existingBrand.save();
                }

                // Ensure category and subcategory exist or create them
                let existingCategory = await Category.findOne({
                    categoryName: category.trim().toLowerCase(),
                });
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

                // Create the product object
                products.push({
                    productName: productName.trim().toLowerCase(),
                    brand: existingBrand._id,
                    category: existingCategory._id,
                    subcategory: subcategory ? subcategory.trim() : undefined,
                    purchasePrice,
                    salePrice,
                    mrp,
                    unit,
                    stockQuantity: openingStock || 0,
                });
            }

            // Insert all valid products into the database
            const insertedProducts = await Product.insertMany(products);

            // Delete the uploaded file
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting file:", err);
            });

            res.status(201).json(
                new ApiResponse(201, { insertedProducts, skippedProducts }, "Products uploaded successfully.")
            );
        } catch (err) {
            // Delete the file in case of an error
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Error deleting file:", err);
                });
            }
            next(err);
        }
    }
);


module.exports = productRouter;
