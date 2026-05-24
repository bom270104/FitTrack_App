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
  requireFields(payload, [
    "fullName",
    "email",
    "password",
    "age",
    "gender",
    "height",
    "weight",
    "activityLevel",
    "goal",
  ]);

  const email = normalizeLowerText(payload.email);
  const password = String(payload.password);
  const gender = normalizeLowerText(payload.gender);
  const activityLevel = normalizeLowerText(payload.activityLevel);
  const goal = normalizeLowerText(payload.goal);

  if (!isEmail(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }

  if (!isStrongPassword(password)) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  if (!GENDER_OPTIONS.includes(gender)) {
    throw new AppError("Invalid gender value", 400);
  }

  if (!activityLevels.includes(activityLevel)) {
    throw new AppError("Invalid activity level", 400);
  }

  if (!goals.includes(goal)) {
    throw new AppError("Invalid goal value", 400);
  }

  return {
    fullName: normalizeText(payload.fullName),
    email,
    password,
    age: parsePositiveNumber(payload.age, "age"),
    gender,
    height: parsePositiveNumber(payload.height, "height"),
    weight: parsePositiveNumber(payload.weight, "weight"),
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
