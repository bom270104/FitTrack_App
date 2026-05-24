import { calculateBMI } from "../utils/calculations.js";
import BmiHistory from "../models/BmiHistory.js";

export const calculateBmiRecord = async (userId, payload) => {
    const bmiResult = calculateBMI(payload.weight, payload.height);

    const record = await BmiHistory.create({
        userId,
        weight: payload.weight,
        height: payload.height,
        bmi: bmiResult.bmi,
        status: bmiResult.classification,
    });

    return {
        bmi: record.bmi,
        status: record.status,
        classification: record.status,
        record,
    };
};

export const getBmiHistory = async (userId) => {
    const logs = await BmiHistory.find({ userId }).sort({ date: -1, createdAt: -1 });

    return {
        logs,
        latest: logs[0] || null,
    };
};