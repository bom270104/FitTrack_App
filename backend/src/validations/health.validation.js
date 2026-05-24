import { GENDER_OPTIONS } from "../constants/index.js";
import { AppError } from "../utils/errors.js";
import {
  normalizeLowerText,
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

export const validateHealthCalculationInput = (payload = {}) => {
  requireFields(payload, [
    "weight",
    "height",
    "age",
    "gender",
    "activityLevel",
    "goal",
  ]);

  const gender = normalizeLowerText(payload.gender);
  const activityLevel = normalizeLowerText(payload.activityLevel);
  const goal = normalizeLowerText(payload.goal);

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
    weight: parsePositiveNumber(payload.weight, "weight"),
    height: parsePositiveNumber(payload.height, "height"),
    age: parsePositiveNumber(payload.age, "age"),
    gender,
    activityLevel,
    goal,
  };
};
