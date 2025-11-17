// errorHandler.js

export default function errorHandler(err, req, res, next) {
  console.error(err); // log internally, but don't send details to client

  const status = err.status || 500;

  const response = {
    success: false,
    message: status === 500
      ? "Internal server error"
      : err.message
  };

  // Only include stack traces in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}
