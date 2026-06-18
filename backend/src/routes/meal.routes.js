import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { logMeal, getTodayMeals, deleteMealFood } from "../controllers/mealController.js";

const router = Router();

router.use(protect);

router.post("/log", logMeal);
router.get("/today", getTodayMeals);
router.delete("/:logId/food/:foodId", deleteMealFood);

export default router;
