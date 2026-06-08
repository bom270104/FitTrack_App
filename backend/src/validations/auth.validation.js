import { GENDER_OPTIONS } from "../constants/index.js";
import { AppError } from "../utils/errors.js";
import {
  isEmail,
  isStrongPassword,
  normalizeLowerText,
  normalizeText,
  parsePositiveNumber,
  requireFields,
} from "../utils/validators.js";

const activityLevels = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];
const goals = ["gain", "lose", "maintain"];

export const validateRegisterInput = (payload = {}) => {
  requireFields(payload, ["fullName", "email", "password"]);

  const email = normalizeLowerText(payload.email);
  const password = String(payload.password);
  const gender = payload.gender ? normalizeLowerText(payload.gender) : undefined;
  const activityLevel = payload.activityLevel ? normalizeLowerText(payload.activityLevel) : undefined;
  const goal = payload.goal ? normalizeLowerText(payload.goal) : undefined;

  if (!isEmail(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }

  if (!isStrongPassword(password)) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  if (gender !== undefined && !GENDER_OPTIONS.includes(gender)) {
    throw new AppError("Invalid gender value", 400);
  }

  if (activityLevel !== undefined && !activityLevels.includes(activityLevel)) {
    throw new AppError("Invalid activity level", 400);
  }

  if (goal !== undefined && !goals.includes(goal)) {
    throw new AppError("Invalid goal value", 400);
  }

  return {
    fullName: normalizeText(payload.fullName),
    email,
    password,
    age: payload.age === undefined || payload.age === null || payload.age === "" ? undefined : parsePositiveNumber(payload.age, "age"),
    gender,
    height: payload.height === undefined || payload.height === null || payload.height === "" ? undefined : parsePositiveNumber(payload.height, "height"),
    weight: payload.weight === undefined || payload.weight === null || payload.weight === "" ? undefined : parsePositiveNumber(payload.weight, "weight"),
    activityLevel,
    goal,
    dailyWaterGoal:
      payload.dailyWaterGoal === undefined ||
        payload.dailyWaterGoal === null ||
        payload.dailyWaterGoal === ""
        ? undefined
        : parsePositiveNumber(payload.dailyWaterGoal, "dailyWaterGoal"),
  };
};

export const validateLoginInput = (payload = {}) => {
  requireFields(payload, ["email", "password"]);

  const email = normalizeLowerText(payload.email);

  if (!isEmail(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }

  return {
    email,
    password: String(payload.password),
  };
};
