const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const errors = err.errors || [];
    const stack = process.env.NODE_ENV === "production" ? null : err.stack;

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
        stack,
    });
};

module.exports = errorHandler;
