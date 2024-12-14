const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        dueDate: {
            type: Date,
        },
        billTo: {
            type: String,
            enum: ["Cash", "Customer"],
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                salePrice: {
                    type: Number,
                    required: true,
                },
                discount: {
                    type: Number,
                    default: 0,
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
        netAmount: {
            type: Number,
            required: true,
        },
        paymentDetails: {
            paymentDate: Date,
            paymentMode: {
                type: String,
                enum: ["Cash", "Bank", "PhonePe", "QR Code"],
            },
            transactionId: String,
            paidAmount: Number,
        },
        privateNote: {
            type: String,
            max: 500,
        },
        customerNote: {
            type: String,
            max: 500,
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
