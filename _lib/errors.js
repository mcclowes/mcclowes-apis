/**
 * Serverless-specific error handling utilities
 * Error classes are imported from api/errors/AppError.js
 */

/**
 * Handles errors and sends appropriate response for serverless functions
 * @param {Error} err - The error to handle
 * @param {object} res - Response object
 */
export const handleError = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // Development error response
  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({
      status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    return;
  }

  // Production error response
  if (err.isOperational) {
    res.status(statusCode).json({
      status,
      code: err.code,
      message: err.message,
    });
    return;
  }

  // Programming or unknown errors: don't leak error details
  console.error("ERROR 💥", err);
  res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong!",
  });
};

/**
 * Wraps an async handler with error handling for serverless functions
 * @param {Function} handler - Async handler function
 * @returns {Function} Wrapped handler
 */
export const withErrorHandling = (handler) => {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      handleError(err, res);
    }
  };
};
