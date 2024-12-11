const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim:true,
        unique: true,
    },
    subcategories: [
        {
            type: String,
            required: true,
        },
    ],
});

module.exports = mongoose.model("Category", categorySchema);
