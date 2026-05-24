import { calculateTDEE } from "../utils/calculations.js";
import CaloriesLog from "../models/CaloriesLog.js";

export const calculateCaloriesRecord = async (userId, payload) => {
    const caloriesResult = calculateTDEE(payload);

    const record = await CaloriesLog.create({
        userId,
        tdee: caloriesResult.tdee,
        goal: payload.goal,
        recommendedCalories: caloriesResult.goalCalories,
        bmr: caloriesResult.bmr,
        activityLevel: payload.activityLevel,
        weight: payload.weight,
        height: payload.height,
        age: payload.age,
        gender: payload.gender,
    });

    return {
        tdee: record.tdee,
        goal: record.goal,
        recommendedCalories: record.recommendedCalories,
        bmr: record.bmr,
        record,
    };
};

export const getCaloriesHistory = async (userId) => {
    const logs = await CaloriesLog.find({ userId }).sort({ date: -1, createdAt: -1 });

    return {
        logs,
        latest: logs[0] || null,
    };
};