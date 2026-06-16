import BmiHistory from "../models/BmiHistory.js";
import CaloriesLog from "../models/CaloriesLog.js";
import WaterLog from "../models/WaterLog.js";
import MealLog from "../models/MealLog.js";
import UserProfile from "../models/UserProfile.js";

const toSeries = (logs, valueKey) =>
    logs
        .slice()
        .sort((left, right) => new Date(left.date) - new Date(right.date))
        .map((log) => ({
            date: log.date,
            value: log[valueKey],
        }));

const totalAmount = (logs = []) =>
    logs.reduce((total, log) => total + (log.amount || 0), 0);

export const getDashboardStats = async (userId) => {
    const [bmiLogs, caloriesLogs, waterLogs] = await Promise.all([
        BmiHistory.find({ userId }).sort({ date: -1, createdAt: -1 }).lean(),
        CaloriesLog.find({ userId }).sort({ date: -1, createdAt: -1 }).lean(),
        WaterLog.find({ userId }).sort({ date: -1, createdAt: -1 }).lean(),
    ]);

    // compute today's meal calories total from MealLog (date stored as YYYY-MM-DD string)
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayMealLogs = await MealLog.find({ userId, date: todayStr }).lean();
    const todayMealTotal = (todayMealLogs || []).reduce((sum, log) => {
        const foods = Array.isArray(log.foods) ? log.foods : [];
        return (
            sum + foods.reduce((s2, f) => s2 + (Number(f.totalCalories) || 0), 0)
        );
    }, 0);

    const userProfile = await UserProfile.findOne({ user_id: userId }).lean();
    const targetWeight = userProfile ? userProfile.target_weight : null;

    return {
        bmi: {
            totalEntries: bmiLogs.length,
            latest: bmiLogs[0] || null,
            recentEntries: bmiLogs.slice(0, 7),
            chart: toSeries(bmiLogs.slice(0, 14), "bmi"),
        },
        calories: {
            totalEntries: caloriesLogs.length,
            latest: caloriesLogs[0] || null,
            recentEntries: caloriesLogs.slice(0, 7),
            chart: toSeries(caloriesLogs.slice(0, 14), "recommendedCalories"),
            // total calories consumed today from meal logs
            dailyTotal: todayMealTotal,
        },
        water: {
            totalEntries: waterLogs.length,
            latest: waterLogs[0] || null,
            recentEntries: waterLogs.slice(0, 7),
            totalAmount: totalAmount(waterLogs),
            chart: toSeries(waterLogs.slice(0, 14), "amount"),
        },
    };
};