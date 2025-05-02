import mongoose, { Schema } from "mongoose";

const repairProcessStepSchema = new Schema({
  stepName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isCritical: {
    type: Boolean,
    default: false
  },
  expectedOutcome: {
    type: String,
    trim: true
  }
}, { _id: false });

const repairProcessSchema = new Schema(
  {
    fault: {
      type: String,
      required: true,
      trim: true,
    },
    subFault: {
      type: String,
      trim: true
    },
    deviceType: {
      type: String,
      required: true,
      enum: ["mobile", "lcd", "pc_laptop", "others"],
      default: "mobile"
    },
    processName: {
      type: String,
      required: true,
      trim: true
    },
    processSteps: [repairProcessStepSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
repairProcessSchema.index({ faultType: 1, deviceType: 1 });

export const RepairProcess = mongoose.model("RepairProcess", repairProcessSchema);