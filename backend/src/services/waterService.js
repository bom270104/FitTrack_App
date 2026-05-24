import WaterLog from "../models/WaterLog.js";
import { AppError } from "../utils/errors.js";

const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const sumAmount = (logs = []) =>
  logs.reduce((total, log) => total + (log.amount || 0), 0);

export const createWaterLog = async (userId, payload) => {
  return WaterLog.create({
    userId,
    amount: payload.amount,
    date: payload.date || new Date(),
  });
};

export const getTodayWaterLogs = async (userId) => {
  const { start, end } = getDayRange();
  const logs = await WaterLog.find({
    userId,
    date: {
      $gte: start,
      $lte: end,
    },
  }).sort({ date: -1, createdAt: -1 });

  return {
    logs,
    totalAmount: sumAmount(logs),
  };
};

export const getWaterHistory = async (userId) => {
  const logs = await WaterLog.find({ userId }).sort({
    date: -1,
    createdAt: -1,
  });

  return {
    logs,
    totalAmount: sumAmount(logs),
  };
};

export const deleteWaterLog = async (userId, logId) => {
  const deletedLog = await WaterLog.findOneAndDelete({ _id: logId, userId });

  if (!deletedLog) {
    throw new AppError("Water log not found", 404);
  }

  return deletedLog;
};
