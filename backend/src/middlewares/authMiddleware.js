import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Not authorized, token missing", 401));
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  const user = await User.findById(decoded.userId);

  if (!user) {
    return next(new AppError("User no longer exists", 401));
  }

  req.user = user;
  next();
};
