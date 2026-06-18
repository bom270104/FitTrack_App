import { AppError } from "../utils/errors.js";

export const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (error, req, res, next) => {
  // log error for debugging
  // eslint-disable-next-line no-console
  console.error(error);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource id",
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";

    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  if (error.name === "ValidationError") {
    const validationMessage = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");

    return res.status(400).json({
      success: false,
      message: validationMessage,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(error.isOperational
      ? {}
      : {
        stack:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
  });
};
