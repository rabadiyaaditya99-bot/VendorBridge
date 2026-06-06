const ApiError = require("../utils/ApiError");
const { ZodError } = require("zod");

const errorMiddleware = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  // Handle Prisma known errors
  if (err.code === "P2002") {
    statusCode = 409;
    const field = err.meta?.target?.[0] || "field";
    message = `A record with this ${field} already exists.`;
  }

  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found.";
  }

  // Log error in development
  if (process.env.NODE_ENV !== "production") {
    console.error("ERROR:", err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
  });
};

module.exports = errorMiddleware;
