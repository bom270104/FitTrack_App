import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
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

  // Sync basic measurements to UserProfile
  const profileUpdates = {};
  if (updates.gender !== undefined) profileUpdates.gender = updates.gender;
  if (updates.age !== undefined) {
    profileUpdates.age = updates.age;
    profileUpdates.date_of_birth = new Date(new Date().getFullYear() - updates.age, 0, 1);
  }
  if (updates.height !== undefined) profileUpdates.height_cm = updates.height;
  if (updates.weight !== undefined) profileUpdates.weight_kg = updates.weight;

  if (Object.keys(profileUpdates).length > 0) {
    await UserProfile.findOneAndUpdate({ user_id: userId }, profileUpdates);
  }

  return user;
};
