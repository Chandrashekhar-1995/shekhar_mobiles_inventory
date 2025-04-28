import mongoose, { Schema } from "mongoose";

const repairSchema = new Schema(
    {
        repairNumber: {
            type: String,
            required: true,
            unique: true,
        },
        bookingDate: {
            type: Date,
            default: Date.now,
        },
        expectDeliveryDate: {
            type: Date,
        },
        billTo: {
            type: String,
            enum: ["cash", "customer"],
            required: true,
            default: "cash",
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
        },
        customerName: String,
        mobileNumber: Number,
        address: String,
        repairing: [{
            type: {
                type: String,
                enum: ["mobile", "lcd", "pc_laptop", "others"],
                default: "mobile",
            },
            brandName: String,
            modelNumber: String,
            emeiNumber: String,
            emeiNumberSecond: String,
            lockOrPassword: String,
            email: String,
            anyDamage: String,
            otherDetails: String,
            repairItem: String,
            problem: String,
            sinceLong: String,
            repairStatus: String,
            repairPrice: Number,
            expectedRepairingDate: Date,
            expectedRepairingTime: {
                type: String,
                match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            },
            repairDescription: String,
        }],
        usedItems: [{
            usedItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            productName: String,
            itemCode: String,
            unit: String,
            quantity: Number,
            mrp: Number,
            salePrice: Number,
            total: Number,
            itemDescription: String,
        }],
        totalAmount: {
            type: Number,
            required: true,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        advanceAmount: {
            type: Number,
            default: 0,
        },
        totalPayableAmount: {
            type: Number,
            required: true,
        },
        paymentDate: {
            type: Date,
            default: Date.now,
        },
        paymentAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
        privateNote: {
            type: String,
            maxlength: 500,
        },
        customerNote: {
            type: String,
            maxlength: 500,
        },
        dueAmount: {
            type: Number,
        },
        status: {
            type: String,
            enum: ["paid", "unpaid", "partially_paid"],
            required: true,
            default: "unpaid",
        },
        bookBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        repairStatus: {
            type: String,
            enum: ["booked", "in_progress", "repair_done", "delivered", "return"],
            required: true,
            default: "booked",
        },
        repairUnder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        repairBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        deliverBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        deliveryTerm: {
            type: String,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

export const Repair = mongoose.model("Repair", repairSchema);
