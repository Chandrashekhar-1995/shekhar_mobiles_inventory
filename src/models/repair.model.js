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
        repairing: [{
            deviceType: {
                type: String,
                enum: ["mobile", "lcd", "pc_laptop", "others"],
                default: "mobile",
            },
            repairItem: String,
            brandName: String,
            modelNo: String,
            emeiNumber: String,
            emeiNumberSecond: String,
            lockOrPassword: String,
            email: String,
            anyDamage: String,
            otherDetails: String,
            fault: String,
            subFaults: String,
            sinceLong: String,
            repairPrice: Number,
            expectedRepairingDate: Date,
            expectedRepairingTime: {
                type: String,
                match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            },
            repairDescription: String,

            usedItem: [{
                item:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },
                productName: String,
                itemCode: String,
                itemSalePrice: Number,
                itemQuantity: Number,
                itemDescription: String,
            }],

            repairStatus: {
                type: String,
                enum: ["booked", "in_progress", "repair_done", "reject", "delivered", "return"],
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
        paymentStatus: {
            type: String,
            enum: ["paid", "unpaid", "partially_paid"],
            required: true,
            default: "unpaid",
        },
        bookBy: {
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
