import app from "./app.js";
import env from "./config/env.js";
import { connectDB } from "./config/db.js";
import { startScheduler } from "./utils/scheduler.js";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
      try {
        startScheduler();
      } catch (err) {
        console.error("Failed to start scheduler:", err);
      }
    });
  } catch (error) {
    const serverError = /** @type {any} */ (error);
    const message =
      serverError instanceof Error ? serverError.message : String(serverError);
    console.error("Failed to start server:", message);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  process.exit(1);
});
