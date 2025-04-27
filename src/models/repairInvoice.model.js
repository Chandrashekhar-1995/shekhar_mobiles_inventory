import mongoose, { Schema } from "mongoose";

const repairSchema = new Schema(
    {
        invoiceType: {
            type: String,
            enum: ["non_gst", "gst", "bill_of_supply"],
            default: "non_gst"
        },
        repairNumber: {
            type: String,
            required: true,
            unique: true,
        },
        bookingDate: {
            type: Date,
            default: Date.today,
        },
        expectDelivery: [{
            date:{
                type: Date,
            },
            time: {
                type: String,
                match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/  // Format: HH:MM
            }
        }],
        deliveryDate: {
            type: Date,
        },
        placeOfSupply:{
            type: String,
            default:"Uttar Pradesh",
        },
        billTo: {
            type: String,
            enum: ["cash", "customer"],
            required: true,
            default:"cash"
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
        repairing:[{
            type: {
                type: String,
                enum: ["mobile", "lcd", "pc_laptop", "others"],
                default: "mobile"
            },
            mobile: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Mobile",
            },
            brand: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Brand",
            },
            brandName: {
                type:String,
            },
            modelNumber: {
                type:String,
            },
            emeiNumber: {
                type:Number,
            },
            emeiNumberSecond: {
                type:Number,
            },
            lockOrPassword: {
                type:String,
            },
            email: {
                type:String,
            },
            anyDamage: {
                type:String,
            },
            otherDetails: {
                type:String,
            },
            repairItem:{
                type:String,
            },
            problem: {
                type:String,
            },
            sinceLong:{
                type:String
            },
            repairStatus: {
                type:String,
            },
            repairPrice:{
                type: Number
            },
            expectedRepairingTime: {
                type: Number,
            },
            repairDescription:{
                type:String,
            },
        }],
        usedItems: [{
            usedItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            productName: {
                type:String,
            },
            itemCode: {
                type:String,
            },
            unit: {
                type:String,
            },
            quantity: {
                type: Number,
            },
            mrp: {
                type: Number,
            },
            salePrice: {
                type: Number,
            },
            total: {
                type: Number,
            },
            itemDescription: {
                type: String,
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
            default:"unpaid"
        },
        bookBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        repairStatus:{
            type:String,
            enum:["booked", "in_progress", "repaire_done", "delivered", "return"],
            required:true,
            default:"booked"
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
            max: 500,
        },
    },
    { timestamps: true }
);

export const Repair = mongoose.model("Repair", repairSchema);
