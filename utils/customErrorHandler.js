class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.success = false; // Set success to false always
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;
