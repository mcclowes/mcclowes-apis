import { AppError } from "./AppError";

const handleError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Development error response
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    return;
  }

  // Production error response
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
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

const handleAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export { handleError, handleAsync };
