export const sendSuccess = (
  res,
  { message = "Request successful", data = {}, statusCode = 200 },
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res,
  { message = "Something went wrong", statusCode = 400, data = {} },
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
};
