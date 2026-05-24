import dotenv from "dotenv";

dotenv.config();

const parsePort = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parsePort(process.env.PORT, 5000),
  databaseUrl: process.env.DATABASE_URL || process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "fittrack-development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "",
};

export const requireEnv = (value, name) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export default env;
