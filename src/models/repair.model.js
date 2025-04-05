import mongoose, { Schema } from "mongoose";

const repairSchema = new Schema(
    {
        invoiceType:{
            type:String,
            enum:{
                values:["non_gst", "gst", "bill_of_supply"],
                message: '{VALUE} is not supported invoice type'
            },
            default:"non_gst"
        },
        repairInvoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        bookingDate: {
            type: Date,
            default: Date.today,
        },
        expectRepairingTime: [{
            date:{
                type: Date,
            },
            time:{
                type: String, //2:00 am , 3:30am etc
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
            type:{
            repairType:String,
            enum:{
                values:["mobile", "lcd", "pc_laptop", "others"],
                message: '{VALUE} is not supported invoice type'
            },
            default:"mobile"
            },
            mobile:[{
                mobile: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Mobile",
                    required: true,
                },
                brandName: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Brand",
                    required: true,
                },
                modelNo: {
                    type:String,
                },
                emeiNumber: {
                    type:String,
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
                fault:[{
                    problem: {
                        type:String,
                    },
                    sinceLong:{
                        type:String
                    },
                    repairStatus: {
                        type:String,
                    },
                }],
                usedItems: [
                    {
                        item: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Product",
                            required: true,
                        },
                        productName: {
                            type:String,
                        },
                        quantity: {
                            type: Number,
                            required: true,
                        },
                        salePrice: {
                            type: Number,
                            required: true,
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
            }],  
        }],
        expectRepairingAmount: {
            type: Number,// jo bata ke book kiye hai
            required: true,
        },
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
            required: true,
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
        bookBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        repairStatus:{
            type:String,
            enum:["in_progress", "repaire_done", "delivered", "return"],
            required:true,
            default:"in_progress"
        },
        repairStatusUnder: {
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
