import mongoose, { Schema } from "mongoose";

const repairTrackingSchema = new Schema({
    repair: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repair",
      required: true
    },
    repairItemIndex: { // Index in the repairing array of Repair model
      type: Number,
      required: true
    },
    process: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairProcess",
      required: true
    },
    currentStep: {
      type: Number,
      default: 0
    },
    steps: [{
      step: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RepairProcess.steps"
      },
      isCompleted: {
        type: Boolean,
        default: false
      },
      completedAt: Date,
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      checklist: [{
        itemName: String,
        isChecked: Boolean,
        checkedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        checkedAt: Date
      }]
    }],
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "paused", "cancelled"],
      default: "pending"
    },
    startedAt: Date,
    completedAt: Date,
    notes: String
  }, { timestamps: true });
  
  export const RepairTracking = mongoose.model("RepairTracking", repairTrackingSchema);