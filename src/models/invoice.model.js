const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
    {
        invoiceType:{
            type:String,
            enum:{
                values:["Non GST", "GST", "Bill of Supply"],
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
        items: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
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
        status:{
            type:String,
            enum:["Paid", "Unpaid", "Partially Paid"],
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

module.exports = mongoose.model("Invoice", invoiceSchema);
