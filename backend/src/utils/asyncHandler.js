/**
 * @template {import("express").RequestHandler} T
 * @param {T} handler
 * @returns {T}
 */
export const asyncHandler = (handler) => (req, res, next) => {
  try {
    const result = handler(req, res, next);

    if (result && typeof result.then === "function") {
      result.catch((err) => {
        try {
          return next(err);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("asyncHandler next call failed:", e);
          throw e;
        }
      });
    }
  } catch (err) {
    // synchronous error
    return next(err);
  }
};
