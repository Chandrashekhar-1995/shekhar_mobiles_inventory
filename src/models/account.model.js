import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema(
  { 
    accountName: {
      type: String,
      trim: true,
      lowercase:true,
      required: [true, "Account name is required"],
    },
    type:{
      type:String,
      enum: {
        values: ["cash", "qr_code", "razorpay", "bank"],
        message: "{VALUE} is not a valid account type",
      },
      required: true
    },
    accountNumber:{
      type:String
    },
    ifscCode:{
      type:String
    },
    branch:{
      type:String
    },
    balance: {
      type: Number,
      required: true,
      default: 0, // Initial balance starts at 0
    },
    status:{
      type:String,
      enum:{
        values:["active", "in_active"],
        message: "{VALUE} is not a valid status",
      }
    },
    transactions: [
      {
        type: {
          type: String,
          enum: {
            values: ["credit", "debit"],
            message: "{VALUE} is not a valid transaction type",
          },
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          required: false,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        referenceId: {
          type: String, // To link the transaction to an invoice or external transaction ID
          required: false,
        },
        transactionId: {
          type: String
        },
        invoiceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Invoice",
        },
        paymentMode: {
          type: String,
          enum: {
            values: ["cash", "qr_code", "razorpay", "bank"],
            message: "{VALUE} is not a valid payment mode",
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Utility method to update account balance
accountSchema.methods.updateBalance = function (type, amount) {
  if (type === "Credit") {
    this.balance += amount;
  } else if (type === "Debit") {
    if (this.balance < amount) {
      throw new Error("Insufficient balance");
    }
    this.balance -= amount;
  }
  return this.balance;
};

export const Account = mongoose.model("Account", accountSchema);
