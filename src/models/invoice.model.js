import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema(
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
            enum: ["cash", "customer"],
            required: true,
            default:"cash"
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
                quantity: {
                    type: Number,
                    required: true,
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
            default:"paid"
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


invoiceSchema.statics.getDailySalesData = async function(days = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          totalSales: { $sum: "$totalAmount" },
          invoiceCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      },
      {
        $project: {
          date: "$_id",
          totalSales: 1,
          invoiceCount: 1,
          _id: 0
        }
      }
    ]);
  };
  
invoiceSchema.statics.getTodaySalesSummary = async function() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
  
    return this.aggregate([
      {
        $match: {
          date: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          invoiceCount: { $sum: 1 }
        }
      }
    ]);
  };

export const Invoice = mongoose.model("Invoice", invoiceSchema);
