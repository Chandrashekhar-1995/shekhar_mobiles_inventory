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
            default: Date.today,
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
            fault:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Fault",
            },
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

repairSchema.statics.getDailyRepairBookingData = async function(days = 90) {
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
            $dateToString: { format: "%Y-%m-%d", bookingDate: "$bookingDate" }
          },
          totalRepairPrice: { $sum:"$totalPayableAmount" },
          bookRepairCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      },
      {
        $project: {
          date: "$_id",
          totalRepairPrice: 1,
          bookRepairCount: 1,
          _id: 0
        }
      }
    ]);
  };


repairSchema.statics.getTodayRepairBookingSummary = async function() {
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
          totalRepairPrice: { $sum:"$totalPayableAmount" },
          bookRepairCount: { $sum: 1 }
        }
      }
    ]);
  };
export const Repair = mongoose.model("Repair", repairSchema);
