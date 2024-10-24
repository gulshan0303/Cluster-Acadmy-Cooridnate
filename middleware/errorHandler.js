
const errorHandler = (err, req, res, next) => {
  let { statusCode, message, data, token } = err;

  if (!statusCode || !message) {
    statusCode = 500;
    message = "Something went wrong, please try again later.";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message || "Invalid data input.";
    data = err.errors || null;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your token has expired. Please log in again.";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value entered.";
    data = err.keyValue;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    data,
    token
  });
};

module.exports = errorHandler;
