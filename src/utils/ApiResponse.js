class ApiResponse {
    constructor(statusCode, data, message = "success", success = true) {
        this.success = success;
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
    }
}

module.exports = ApiResponse;
