const mongoose = require("mongoose");

const mobileSchema = new mongoose.Schema(
    {
        type:{
            type:String,
            enum:{
                values:["New", "Second Hand", "Repair"],
                message: '{VALUE} is not supported invoice type'
            },
            default:"Repair"
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true,
        },
        brandName:{
            type:String,
        },
        modelNo: { 
            type: String,
        },
        emeiNumber:{
            type:String,
            max:100,
        },
        productImage: {
            type: String,
        },
        purchasePrice: {
            type: Number, 
        },
        salePrice: {
            type: Number,
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
        description: {
            type: String,
        },
        warranty: {
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
                ref: "PurchaseInvoice",
            },
        ],
        repairHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Repair",
            },
        ],
        printDescription: {
            type: Boolean,
            default: true,
        },
        enableTracking: {
            type: Boolean,
            default: true,
        },
        printEmeiNo: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Mobile", mobileSchema);
