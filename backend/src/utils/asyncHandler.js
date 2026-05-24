/**
 * @template {import("express").RequestHandler} T
 * @param {T} handler
 * @returns {T}
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
