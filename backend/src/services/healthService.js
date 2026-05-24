import HealthLog from "../models/HealthLog.js";
import { calculateBMI, calculateTDEE } from "../utils/calculations.js";

export const calculateHealthMetrics = async (userId, payload) => {
  const bmiResult = calculateBMI(payload.weight, payload.height);
  const tdeeResult = calculateTDEE(payload);

  const healthLog = await HealthLog.create({
    userId,
    weight: payload.weight,
    bmi: bmiResult.bmi,
    tdee: tdeeResult.tdee,
    goalCalories: tdeeResult.goalCalories,
  });

  return {
    healthLog,
    bmi: bmiResult,
    tdee: tdeeResult,
  };
};

export const getHealthHistory = async (userId) => {
  const logs = await HealthLog.find({ userId }).sort({ createdAt: -1 });
  return logs;
};

export const getHealthStatistics = async (userId) => {
  const logs = await HealthLog.find({ userId }).sort({ createdAt: -1 }).lean();

  if (logs.length === 0) {
    return {
      totalEntries: 0,
      averages: {
        weight: 0,
        bmi: 0,
        tdee: 0,
        goalCalories: 0,
      },
      latest: null,
      recentEntries: [],
    };
  }

  const totals = logs.reduce(
    (accumulator, log) => ({
      weight: accumulator.weight + log.weight,
      bmi: accumulator.bmi + log.bmi,
      tdee: accumulator.tdee + log.tdee,
      goalCalories: accumulator.goalCalories + log.goalCalories,
    }),
    { weight: 0, bmi: 0, tdee: 0, goalCalories: 0 },
  );

  const count = logs.length;

  return {
    totalEntries: count,
    averages: {
      weight: Number((totals.weight / count).toFixed(1)),
      bmi: Number((totals.bmi / count).toFixed(1)),
      tdee: Math.round(totals.tdee / count),
      goalCalories: Math.round(totals.goalCalories / count),
    },
    latest: logs[0],
    recentEntries: logs.slice(0, 7),
  };
};
