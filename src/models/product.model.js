const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: [true, "Product name is required"],
            unique: true,
            trim: true,
            index: true,
        },
        itemCode: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        subcategory: {
            type: String,
            required: true,
            trim: true,
        },
        purchasePrice: {
            type: Number,
            required: true,
        },
        salePrice: {
            type: Number,
            required: true,
        },
        minSalePrice: {
            type: Number,
        },
        mrp: {
            type: Number,
        },
        stockQuantity: {
            type: Number,
            default: 0,
        },
        unit: {
            type: String,
            required: true,
            enum: ["UNT", "PCS", "NOS", "MTR", "BOX"],
        },
        saleDiscount: {
            // it is in %
            type: Number,
            max: 90,
        },
        lowLevelLimit: {
            type: Number,
        },
        productImage: {
            type: String, // Cloudinary URL or other storage service URL
        },
        description: {
            type: String,
        },
        warranty: {
            type: String,
        },
        location: {
            type: String,
        },
        saleHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        purchaseHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        // New fields for additional product settings
        settings: {
            printDescription: {
                type: Boolean,
                default: true,
            },
            oneClickSale: {
                type: Boolean,
                default: true,
            },
            enableTracking: {
                type: Boolean,
                default: true,
            },
            printSerialNo: {
                type: Boolean,
                default: false,
            },
            notForSale: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);
