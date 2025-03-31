import mongoose, { Schema } from "mongoose";

const brandSchema = new Schema({
    brandName: {
        type: String,
        required: true,
        trim:true,
        unique: true,
    }
});

export const Brand = mongoose.model("Brand", brandSchema);
