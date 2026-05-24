import { AppError } from "../utils/errors.js";
import {
  parseOptionalDate,
  parsePositiveNumber,
  requireFields,
} from "../utils/validators.js";

export const validateWaterLogInput = (payload = {}) => {
  requireFields(payload, ["amount"]);

  return {
    amount: parsePositiveNumber(payload.amount, "amount"),
    date: parseOptionalDate(payload.date, "date"),
  };
};

export const validateObjectId = (value, fieldName = "id") => {
  if (!value || !/^[a-fA-F0-9]{24}$/.test(String(value))) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }

  return String(value);
};
