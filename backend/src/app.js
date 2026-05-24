import express from "express";
import cors from "cors";

import env from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import waterRoutes from "./routes/water.routes.js";
import healthRoutes from "./routes/health.routes.js";
import bmiRoutes from "./routes/bmi.routes.js";
import caloriesRoutes from "./routes/calories.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin || true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FitTrack API is running",
    data: {},
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "API health check passed",
    data: { ok: true },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bmi", bmiRoutes);
app.use("/api/calories", caloriesRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/health", healthRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
