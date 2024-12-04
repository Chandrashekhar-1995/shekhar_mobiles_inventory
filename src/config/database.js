const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connection successfully established");
    } catch (error) {
        console.error("Database connection failed", error);
        throw error;
    }
};

module.exports = connectDB;