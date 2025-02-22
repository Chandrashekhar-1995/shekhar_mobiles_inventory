const mongoose = require("mongoose");

const purchaseInvoiceSchema = new mongoose.Schema(
    {
    invoiceType: {
        type: String, 
        enum:{
            values:["Non GST", "GST", "Bill of Supply"],
            message: '{VALUE} is not supported invoice type'
        },
        default:"Non GST"
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
        enum: ["Cash", "Supplier"], 
        required: true,
        default:"Cash"
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Customer" 
    },
    supplierName: {
        type: String 

    },
    mobileNumber: {
        type: String
    },
    address: {
        type: String
    },
    items: [
        {
        item: {
            type: mongoose.Schema.Types.ObjectId, ref: "Product",
            required: true,
        },
        productName: {
            type: String, 
            required: true
        },
        itemCode: {
            type: String
        },
        unit: {
            type: String
        },
        quantity: {
            type: Number, 
            required: true
        },
        purchasePrice: {
            type: Number, 
            required: true
        },
        mrp: {
            type: Number
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

module.exports = mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);