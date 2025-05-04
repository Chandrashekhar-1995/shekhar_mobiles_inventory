import mongoose, { Schema } from "mongoose";

const repairProcessStepSchema = new Schema({
  stepName: {
    type: String,
    required: true
  },
  description: String,
  checklistItems: [{
    itemName: {
      type: String,
      required: true
    },
    isChecked: {
      type: Boolean,
      default: false
    }
  }],
  order: {
    type: Number,
    required: true
  }
});

const repairProcessSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  fault: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fault",
    required: true
  },
  deviceType: {
    type: String,
    enum: ["mobile", "lcd", "pc_laptop", "others"],
    default: "mobile"
  },
  steps: [repairProcessStepSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

export const RepairProcess = mongoose.model("RepairProcess", repairProcessSchema);