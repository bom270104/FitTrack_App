import mongoose from "mongoose";
import Food from "../models/Food.js";
import MealLog from "../models/MealLog.js";
import { AppError } from "../utils/errors.js";

const formatTodayDate = () => {
    return new Date().toISOString().slice(0, 10);
};

const escapeRegex = (value) =>
    String(value).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

const round = (value) => Math.round(value * 10) / 10;

export const searchFoodsByQuery = async (query) => {
    const regex = new RegExp(escapeRegex(query), "i");

    return Food.find({
        $or: [{ name: regex }, { category: regex }],
    })
        .sort({ name: 1 })
        .limit(50)
        .lean();
};

export const buildFoodLogItem = (food, weightGrams) => {
    const ratio = weightGrams / Math.max(1, food.servingSize);

    return {
        foodId: food._id,
        name: food.name,
        weightGrams: round(weightGrams),
        totalCalories: round(food.calories * ratio),
        protein: round(food.protein * ratio),
        carbs: round(food.carbs * ratio),
        fat: round(food.fat * ratio),
    };
};

export const addMealLogEntry = async (userId, mealType, foodId, weightGrams) => {
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
        throw new AppError("foodId không hợp lệ", 400);
    }

    const food = await Food.findById(foodId).lean();
    if (!food) {
        throw new AppError("Không tìm thấy thực phẩm", 404);
    }

    const entry = buildFoodLogItem(food, weightGrams);

    const log = await MealLog.findOneAndUpdate(
        { userId, date: formatTodayDate(), mealType },
        { $push: { foods: entry } },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    ).lean();

    return log;
};

export const getTodayMealGroups = async (userId) => {
    const logs = await MealLog.find({ userId, date: formatTodayDate() }).lean();

    const groups = {
        breakfast: {
            logId: null,
            mealType: "breakfast",
            foods: [],
            totalCalories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
        },
        lunch: {
            logId: null,
            mealType: "lunch",
            foods: [],
            totalCalories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
        },
        dinner: {
            logId: null,
            mealType: "dinner",
            foods: [],
            totalCalories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
        },
        snack: {
            logId: null,
            mealType: "snack",
            foods: [],
            totalCalories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
        },
    };

    for (const log of logs) {
        const group = groups[log.mealType];
        if (!group) continue;

        group.logId = String(log._id);
        group.foods = (log.foods || []).map((item) => ({
            foodId: String(item.foodId),
            name: item.name,
            weightGrams: item.weightGrams,
            totalCalories: item.totalCalories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
        }));
        group.totalCalories = log.foods.reduce((sum, item) => sum + (item.totalCalories || 0), 0);
        group.protein = log.foods.reduce((sum, item) => sum + (item.protein || 0), 0);
        group.carbs = log.foods.reduce((sum, item) => sum + (item.carbs || 0), 0);
        group.fat = log.foods.reduce((sum, item) => sum + (item.fat || 0), 0);
    }

    return groups;
};

export const removeFoodFromMealLog = async (userId, logId, foodId) => {
    if (!mongoose.Types.ObjectId.isValid(logId) || !mongoose.Types.ObjectId.isValid(foodId)) {
        throw new AppError("logId hoặc foodId không hợp lệ", 400);
    }

    const updated = await MealLog.findOneAndUpdate(
        { _id: logId, userId },
        { $pull: { foods: { foodId } } },
        { returnDocument: "after" },
    ).lean();

    if (!updated) {
        throw new AppError("Không tìm thấy nhật ký bữa ăn", 404);
    }

    if (!updated.foods || updated.foods.length === 0) {
        await MealLog.deleteOne({ _id: logId, userId });
        return null;
    }

    return updated;
};
