import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { validateFoodSearchInput, validateLogMealInput } from "../validations/meal.validation.js";
import {
    searchFoodsByQuery,
    addMealLogEntry,
    getTodayMealGroups,
    removeFoodFromMealLog,
} from "../services/mealService.js";

export const searchFoods = asyncHandler(async (req, res) => {
    const q = validateFoodSearchInput(req.query.q);
    const foods = await searchFoodsByQuery(q);

    return sendSuccess(res, {
        message: "Foods retrieved successfully",
        data: { foods },
    });
});

export const logMeal = asyncHandler(async (req, res) => {
    const { mealType, foodId, weightGrams } = validateLogMealInput(req.body);
    const meal = await addMealLogEntry(req.user._id, mealType, foodId, weightGrams);

    return sendSuccess(res, {
        statusCode: 201,
        message: "Meal logged successfully",
        data: { meal },
    });
});

export const getTodayMeals = asyncHandler(async (req, res) => {
    const meals = await getTodayMealGroups(req.user._id);

    return sendSuccess(res, {
        message: "Today's meals retrieved successfully",
        data: { meals },
    });
});

export const deleteMealFood = asyncHandler(async (req, res) => {
    const { logId, foodId } = req.params;
    await removeFoodFromMealLog(req.user._id, logId, foodId);

    return sendSuccess(res, {
        message: "Food removed from meal log successfully",
        data: {},
    });
});
