import mongoose, { Schema } from "mongoose";

const modelNoSchema = new Schema({
    modelNo: {
        type: String,
        required: true,
        trim:true,
        unique: true,
    }
});

export const ModelNo = mongoose.model("ModelNo", modelNoSchema);
