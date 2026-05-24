import { AppError } from "./errors.js";

export const isEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value || "")
      .trim()
      .toLowerCase(),
  );
};

export const isStrongPassword = (value) => {
  const password = String(value || "");
  return password.length >= 8;
};

export const requireFields = (payload, fields) => {
  const missingFields = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required field${missingFields.length > 1 ? "s" : ""}: ${missingFields.join(", ")}`,
      400,
    );
  }
};

export const parsePositiveNumber = (value, fieldName) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new AppError(`Invalid numeric input for ${fieldName}`, 400);
  }

  return numericValue;
};

export const parseOptionalDate = (value, fieldName) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`Invalid date input for ${fieldName}`, 400);
  }

  return date;
};

export const normalizeText = (value) => String(value || "").trim();

export const normalizeLowerText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
