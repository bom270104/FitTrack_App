import { GENDER_OPTIONS } from "../constants/index.js";
import { AppError } from "../utils/errors.js";
import {
  normalizeLowerText,
  normalizeText,
  parsePositiveNumber,
} from "../utils/validators.js";

const activityLevels = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];
const goals = ["gain", "lose", "maintain"];

export const validateProfileUpdateInput = (payload = {}) => {
  const allowedKeys = [
    "fullName",
    "age",
    "gender",
    "height",
    "weight",
    "activityLevel",
    "goal",
    "dailyWaterGoal",
  ];
  const incomingKeys = Object.keys(payload);

  if (incomingKeys.length === 0) {
    throw new AppError("At least one profile field is required", 400);
  }

  const invalidKeys = incomingKeys.filter((key) => !allowedKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new AppError(
      `Unsupported profile field${invalidKeys.length > 1 ? "s" : ""}: ${invalidKeys.join(", ")}`,
      400,
    );
  }

  const updates = {};

  if (payload.fullName !== undefined)
    updates.fullName = normalizeText(payload.fullName);
  if (payload.age !== undefined)
    updates.age = parsePositiveNumber(payload.age, "age");

  if (payload.gender !== undefined) {
    const gender = normalizeLowerText(payload.gender);
    if (!GENDER_OPTIONS.includes(gender)) {
      throw new AppError("Invalid gender value", 400);
    }
    updates.gender = gender;
  }

  if (payload.height !== undefined)
    updates.height = parsePositiveNumber(payload.height, "height");
  if (payload.weight !== undefined)
    updates.weight = parsePositiveNumber(payload.weight, "weight");

  if (payload.activityLevel !== undefined) {
    const activityLevel = normalizeLowerText(payload.activityLevel);
    if (!activityLevels.includes(activityLevel)) {
      throw new AppError("Invalid activity level", 400);
    }
    updates.activityLevel = activityLevel;
  }

  if (payload.goal !== undefined) {
    const goal = normalizeLowerText(payload.goal);
    if (!goals.includes(goal)) {
      throw new AppError("Invalid goal value", 400);
    }
    updates.goal = goal;
  }

  if (payload.dailyWaterGoal !== undefined) {
    updates.dailyWaterGoal = parsePositiveNumber(
      payload.dailyWaterGoal,
      "dailyWaterGoal",
    );
  }

  return updates;
};
