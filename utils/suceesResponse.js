const successResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  };
  
  module.exports = successResponse;
  