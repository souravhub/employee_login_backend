class ApiResponse {
    constructor(stausCode, data, message = "Success") {
        this.stausCode = stausCode;
        this.data = data;
        this.meassge = message;
        this.success = stausCode < 400;
    }
}

export { ApiResponse };
