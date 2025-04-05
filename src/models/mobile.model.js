import mongoose, { Schema } from "mongoose";

const mobileSchema = new Schema(
    {
        mobileType:{
            type:String,
            enum:{
                values:["new", "second_hand", "repair"],
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
        },
        emeiNumberSecond:{
            type:String,
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

export const Mobile = mongoose.model("Mobile", mobileSchema);
