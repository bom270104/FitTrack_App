// @ts-nocheck
import User from "../models/User.js";
import { AppError } from "../utils/errors.js";
import { generateToken } from "../utils/jwt.js";
import { isMailerConfigured, sendMail } from "./mailerService.js";

export const registerUser = async (payload) => {
  const existingUser = await User.findOne({
    email: payload.email,
  });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const created = await User.create({
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    age: payload.age,
    gender: payload.gender,
    height: payload.height,
    weight: payload.weight,
    activityLevel: payload.activityLevel,
    goal: payload.goal,
    dailyWaterGoal: payload.dailyWaterGoal,
  });

  const user = await User.findById(created._id);

  const token = generateToken({
    userId: user._id.toString(),
  });

  if (isMailerConfigured()) {
    try {
      await sendMail({
        to: user.email,
        subject: "Welcome to FitTrack",
        text:
          `Hi ${user.fullName},\n\n` +
          "Your FitTrack account has been created successfully.\n\n" +
          "— FitTrack",
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error.message || error);
    }
  }

  return {
    user,
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken({
    userId: user._id.toString(),
  });

  const sanitizedUser = await User.findById(user._id);

  return {
    user: sanitizedUser,
    token,
  };
};

export const getAuthenticatedUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const logoutUser = async () => true;
