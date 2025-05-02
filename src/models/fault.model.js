import mongoose, { Schema } from "mongoose";

const faultSchema = new Schema({
    fault: {
        type: String,
        required: true,
        trim:true,
        unique: true,
    },
    subFault: {
        type: String,
        trim: true
      },
});

export const Fault = mongoose.model("Fault", faultSchema);
