import mongoose, { Schema } from "mongoose";

const purchaseInvoiceSchema = new Schema(
    {
        invoiceType:{
            type:String,
            enum:{
                values:["non_gst", "gst", "bill_of_supply"],
                message: '{VALUE} is not supported invoice type'
            },
            default:"non_gst"
        },
    invoiceNumber: {
        type: String, 
        required: true, 
        unique: true 
    },
    date: {
        type: Date, 
        default: Date.today,
        required: true 
    },
    dueDate: {
        type: Date,
        default: Date.today,
    },
    placeOfSupply: {
        type: String,
        default:"Uttar Pradesh",
        },
    billFrom: {
        type: String,
        enum: ["cash", "supplier"], 
        required: true,
        default:"cash"
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Customer" 
    },
    items: [
        {
        item: {
            type: mongoose.Schema.Types.ObjectId, ref: "Product",
            required: true,
        },
        quantity: {
            type: Number, 
            required: true
        },
        purchasePrice: {
            type: Number, 
            required: true
        },
        discount: {
            type: Number
        },
        tax:{
            type:Number
        },
        cess:{
            type:Number
        },
        total: {
            type: Number,
            required: true
        },
        itemDescription: {
            type: String
        }
    }],
    totalAmount: {
        type: Number, 
        required: true
    },
    discountAmount: {
        type: Number
    },
    totalPayableAmount: {
        type: Number, 
        required: true 
    },
    paymentDate: {
        type: Date
    },
    paymentMode: {
        type: String
    },
    paymentAccount: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Account",
            },
    paidAmount: {
        type: Number
    },
    transactionId: {
        type: String
    },
    status: {
        type: String, 
        enum: ["Paid", "Partially Paid", "Unpaid"], default: "Unpaid" 
    },
    privateNote: {
        type: String 
    },
    supplierNote: {
        type: String 
    },
    purchaseBy: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    },
    deliveryTerm: {
        type: String
    },
    srNumber: {
        type: String
    }
}, 
{
    timestamps: true
}
);

export const PurchaseInvoice = mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);