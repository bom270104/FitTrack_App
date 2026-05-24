import {
  ACTIVITY_LEVELS,
  BMI_CLASSIFICATIONS,
  GOAL_CALORIE_ADJUSTMENTS,
} from "../constants/index.js";
import { AppError } from "./errors.js";

const getBmiClassification = (bmi) => {
  const classification = BMI_CLASSIFICATIONS.find(
    (range) => bmi >= range.min && bmi < range.max,
  );

  return classification?.label || "Unknown";
};

const getBmr = ({ weight, height, age, gender }) => {
  const normalizedGender = String(gender || "")
    .trim()
    .toLowerCase();

  if (
    !Number.isFinite(weight) ||
    !Number.isFinite(height) ||
    !Number.isFinite(age)
  ) {
    throw new AppError("Invalid numeric input for calorie calculation", 400);
  }

  if (normalizedGender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }

  if (normalizedGender === "female") {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }

  return 10 * weight + 6.25 * height - 5 * age - 78;
};

export const calculateBMI = (weight, height) => {
  if (!Number.isFinite(weight) || !Number.isFinite(height) || height <= 0) {
    throw new AppError("Invalid BMI input", 400);
  }

  const bmi = weight / Math.pow(height / 100, 2);

  return {
    bmi: Number(bmi.toFixed(1)),
    classification: getBmiClassification(bmi),
  };
};

export const calculateTDEE = ({
  weight,
  height,
  age,
  gender,
  activityLevel,
  goal,
}) => {
  const normalizedActivityLevel = String(activityLevel || "")
    .trim()
    .toLowerCase();
  const normalizedGoal = String(goal || "")
    .trim()
    .toLowerCase();
  const activityMultiplier = ACTIVITY_LEVELS[normalizedActivityLevel];

  if (!activityMultiplier) {
    throw new AppError("Invalid activity level", 400);
  }

  const bmr = getBmr({ weight, height, age, gender });
  const tdee = bmr * activityMultiplier;
  const goalAdjustment = GOAL_CALORIE_ADJUSTMENTS[normalizedGoal];

  if (goalAdjustment === undefined) {
    throw new AppError("Invalid goal value", 400);
  }

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    goalCalories: Math.round(tdee + goalAdjustment),
    activityMultiplier,
    goalAdjustment,
  };
};
