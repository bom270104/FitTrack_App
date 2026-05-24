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

const goalAliases = {
    gain_weight: "gain",
    lose_weight: "lose",
    maintain_weight: "maintain",
    gain: "gain",
    lose: "lose",
    maintain: "maintain",
};

export const validateCaloriesCalculationInput = (payload = {}) => {
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
    const rawGoal = normalizeLowerText(payload.goal);
    const goal = goalAliases[rawGoal];

    if (!GENDER_OPTIONS.includes(gender)) {
        throw new AppError("Invalid gender value", 400);
    }

    if (!activityLevels.includes(activityLevel)) {
        throw new AppError("Invalid activity level", 400);
    }

    if (!goal) {
        throw new AppError("Invalid goal value", 400);
    }

    return {
        weight: parsePositiveNumber(payload.weight, "weight"),
        height: parsePositiveNumber(payload.height, "height"),
        age: parsePositiveNumber(payload.age, "age"),
        gender,
        activityLevel,
        goal,
        goalLabel: rawGoal || goal,
    };
};