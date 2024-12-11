const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    subcategories: [
        {
            type: String,
            trim: true,
            lowercase: true,
        },
    ],
});

module.exports = mongoose.model("Category", categorySchema);
