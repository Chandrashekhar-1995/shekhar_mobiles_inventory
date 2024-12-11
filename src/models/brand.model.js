const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim:true,
        unique: true,
    }
});

module.exports = mongoose.model("Brand", brandSchema);
