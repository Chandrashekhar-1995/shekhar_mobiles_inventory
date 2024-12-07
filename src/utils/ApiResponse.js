class ApiResponse {
    constructor(statusCode, data, message, success) {
        this.success = success;
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
    }
}

module.exports = ApiResponse;
