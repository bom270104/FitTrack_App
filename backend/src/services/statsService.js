import BmiHistory from "../models/BmiHistory.js";
import CaloriesLog from "../models/CaloriesLog.js";
import WaterLog from "../models/WaterLog.js";

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