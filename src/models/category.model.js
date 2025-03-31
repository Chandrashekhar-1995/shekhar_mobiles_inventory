import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    categoryName: {
        type: String,
        required: true,
        trim: true,
        unique:true,
    },
    subcategories: [
        {
            type: String,
            trim: true,
        },
    ],
});

export const Category = mongoose.model("Category", categorySchema);
