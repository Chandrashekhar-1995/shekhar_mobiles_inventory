const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
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

module.exports = mongoose.model("Category", categorySchema);
