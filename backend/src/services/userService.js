import User from "../models/User.js";
import { AppError } from "../utils/errors.js";

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const updateUserProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(userId, updates, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
