import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema(
    {
        invoiceType:{
            type:String,
            enum:{
                values:["non_gst", "gst", "bill_of_supply"],
                message: '{VALUE} is not supported invoice type'
            },
            default:"Non GST"
        },
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        date: {
            type: Date,
            default: Date.today,
        },
        dueDate: {
            type: Date,
            default: Date.today,
        },
        placeOfSupply:{
            type: String,
            default:"Uttar Pradesh",
        },
        billTo: {
            type: String,
            enum: ["Cash", "Customer"],
            required: true,
            default:"Cash"
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
        },
        customerName: {
            type: String,
        },
        mobileNumber: {
            type: Number,
        },
        address: {
            type: String,
        },
        items: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                productName: {
                    type:String,
                },
                itemCode: {
                    type:String,
                },
                unit:{
                    type:String
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                salePrice: {
                    type: Number,
                    required: true,
                },
                mrp:{
                    type:Number
                },
                discount: {
                    type: Number,
                    default: 0,
                },
                tax:{
                    type:Number
                },
                cess:{
                    type:Number
                },
                total: {
                    type: Number,
                    required: true,
                },
                itemDescription: {
                    type: String,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        totalPayableAmount: {
            type: Number,
            required: true,
        },
        paymentDate:{
            type: Date,
            default: Date.today,
        },
        paymentAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
        privateNote: {
            type: String,
            max: 500,
        },
        customerNote: {
            type: String,
            max: 500,
        },
        receivedAmount:{
            type:Number
        },
        dueAmount:{
            type:Number
        },
        status:{
            type:String,
            enum:["paid", "unpaid", "partially_paid"],
            required:true,
            default:"Unpaid"
        },
        soldBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        deliveryTerm: {
            type: String,
            max: 500,
        },
    },
    { timestamps: true }
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
