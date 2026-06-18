import { AppError } from "../utils/errors.js";
import { normalizeLowerText, parsePositiveNumber, requireFields } from "../utils/validators.js";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export const validateFoodSearchInput = (query) => {
    const keyword = String(query || "").trim();

    if (keyword.length === 0) {
        throw new AppError("Query tìm kiếm cần phải có giá trị", 400);
    }

    return keyword;
};

export const validateLogMealInput = (payload) => {
    requireFields(payload, ["mealType", "foodId", "weightGrams"]);

    const mealType = normalizeLowerText(payload.mealType);
    if (!MEAL_TYPES.includes(mealType)) {
        throw new AppError("mealType phải là breakfast, lunch, dinner hoặc snack", 400);
    }

    return {
        mealType,
        foodId: String(payload.foodId).trim(),
        weightGrams: parsePositiveNumber(payload.weightGrams, "weightGrams"),
    };
};
