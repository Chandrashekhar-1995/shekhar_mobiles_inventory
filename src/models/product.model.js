const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ["Product", "Service"],
            default: "Product",
        },
        productName: { 
            type: String,
            required: [true, "Product name is required"],
            unique: true,
            trim: true,
            lowercase: true,
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
            default: "PCS",
        },
        hsnCode: {
            type: String,
            max: 250,
        },
        gstRate: {
            type: Number, // percentage
            max: 90,
        },
        saleDiscount: {
            type: Number, // percentage discount
            max: 90,
        },
        lowLevelLimit: {
            type: Number,
        },
        serialNumber:{
            type:String,
            max:100,
        },
        productImage: {
            type: String,
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
                ref: "Invoice",
            },
        ],
        purchaseHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Invoice",
            },
        ],

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
            default: true,
        },
        notForSale: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model overwrite if it already exists
module.exports = mongoose.model("Product", productSchema);
