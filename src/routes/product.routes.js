const express = require("express");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");
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
        itemCode,
        brand,
        category,
        subcategory,
        purchasePrice,
        salePrice,
        minSalePrice,
        mrp,
        openingStock,
        unit,
        hsnCode,
        gstRate,
        saleDiscount,
        lowLevelLimit,
        serialNumber,
        productImage,
        description,
        warranty,
        location,
        printDescription,
        oneClickSale,
        enableTracking,
        printSerialNo,
        notForSale,
    } = req.body;

    try {
        // Validate input
        if (!productName || !brand || !category || !purchasePrice || !salePrice || !unit) {
            throw new ApiError(
                400,
                "Product name, brand, category, purchase price, sale price, and unit are required."
            );
        }

         // Check for duplicate itemCode
        const existingItemCode = await Product.findOne({ itemCode: itemCode.trim().toLowerCase() });
        if (existingItemCode) {
            throw new ApiError(400, `A product with the item code '${itemCode}' already exists.`);
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
            itemCode: itemCode.trim().toLowerCase(),
            brand: existingBrand._id,
            category: existingCategory._id,
            subcategory: subcategory ? subcategory.trim() : undefined,
            purchasePrice,
            salePrice,
            minSalePrice,
            mrp,
            unit,
            stockQuantity: openingStock || 0,
            hsnCode,
            gstRate,
            saleDiscount,
            lowLevelLimit: lowLevelLimit || undefined,
            serialNumber,
            productImage,
            description: description || undefined,
            warranty: warranty || undefined,
            location: location || undefined,
            printDescription,
            oneClickSale,
            enableTracking,
            printSerialNo,
            notForSale,
        });

        await product.save();

        res.status(201).json(new ApiResponse(201, product, "Product created successfully."));
    } catch (err) {
        next(err);
    }
});



// API to download product upload template
productRouter.get("/product/template", async (req, res, next) => {
    try {
        // Headers with required fields marked
        const headers = [
            { field: "productName", label: "Product Name *", required: true },
            { field: "itemCode", label: "Item Code", required: false },
            { field: "brand", label: "Brand *", required: true },
            { field: "category", label: "Category *", required: true },
            { field: "subcategory", label: "Subcategory", required: false },
            { field: "purchasePrice", label: "Purchase Price *", required: true },
            { field: "salePrice", label: "Sale Price *", required: true },
            { field: "minSalePrice", label: "Min Sale Price", required: false },
            { field: "mrp", label: "MRP", required: false },
            { field: "unit", label: "Unit *", required: true, dropdown: ["UNT", "PCS", "NOS", "MTR", "BOX"] },
            { field: "hsnCode", label: "HSN Code", required: false },
            { field: "gstRate", label: "GST Rate", required: false },
            { field: "saleDiscount", label: "Sale Discount", required: false },
            { field: "lowLevelLimit", label: "Low Level Limit", required: false },
            { field: "serialNumber", label: "Serial Number", required: false },
            { field: "description", label: "Description", required: false },
            { field: "warranty", label: "Warranty", required: false },
            { field: "location", label: "location", required: false },
            { field: "openingStock", label: "OpeningStock", required: false },
            { field: "printDescription", label: "Print Description", required: false, dropdown: ["true", "false"] },
            { field: "printSerialNo", label: "Print Serial No", required: false },
            { field: "oneClickSale", label: "One Click Sale", required: false },
            { field: "enableTracking", label: "Enable Tracking", required: false },
        ];

        // Initialize a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const templateSheet = workbook.addWorksheet("Template");
        const instructionSheet = workbook.addWorksheet("Instructions");

        // Add headers to the template sheet
        const headerRow = templateSheet.addRow(headers.map((header) => header.label));

        // Style headers
        headerRow.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: header.required ? "FFA500" : "D3D3D3" },
            };
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };

             // Adjust column width dynamically based on the header text length
             const headerLength = header.label.length; // Length of the header text
             templateSheet.getColumn(colNumber).width = Math.max(15, headerLength + 5); // Minimum width 15, extra padding 5
        });

        // Set the row height dynamically for the header row
        const headerRowHeight = 40;
        templateSheet.getRow(headerRow.number).height = headerRowHeight;


        // Add dropdowns for specific fields
        headers.forEach((header, index) => {
            if (header.dropdown) {
                // Apply dropdown to all rows in the column
                const colLetter = String.fromCharCode(65 + index);
                templateSheet.getColumn(index + 1).eachCell((cell, rowNumber) => {
                    if (rowNumber > 1) {
                        cell.dataValidation = {
                            type: "list",
                            allowBlank: false,
                            formula1: `"${header.dropdown.join(",")}"`,
                        };
                    }
                });
            }
        });

        // Add instructions to the second sheet
        instructionSheet.addRow(["Field Name", "Required/Optional", "Description/Example"]);
        headers.forEach((header) => {
            instructionSheet.addRow([
                header.label,
                header.required ? "Required" : "Optional",
                header.dropdown ? `Allowed values: ${header.dropdown.join(", ")}` : "Free text",
            ]);
        });

        // Style instruction headers
        instructionSheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "CCCCCC" },
            };
        });

        // Save workbook to file
        const filePath = path.join(__dirname, "../uploads/product-template.xlsx");
        await workbook.xlsx.writeFile(filePath);

        // Send the file as a response
        res.download(filePath, "product-template.xlsx", (err) => {
            if (err) {
                next(err);
            }

            // Delete the file after sending it
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        next(err);
    }
});




// Bulk upload API
productRouter.post("/product/bulk-upload",  upload.single("file"),
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
