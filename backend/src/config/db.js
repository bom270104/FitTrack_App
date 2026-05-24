import mongoose from "mongoose";

import env, { requireEnv } from "./env.js";

export const connectDB = async () => {
  const databaseUrl = requireEnv(env.databaseUrl, "DATABASE_URL");

  await mongoose.connect(databaseUrl, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected");
};
