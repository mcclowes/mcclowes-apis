/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, "NOT_FOUND");
  }
}

export class AuthenticationError extends AppError {
  constructor(message) {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message) {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class ExternalServiceError extends AppError {
  constructor(message) {
    super(message, 502, "EXTERNAL_SERVICE_ERROR");
  }
}

/**
 * Handles errors and sends appropriate response
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
 * Wraps an async handler with error handling
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
