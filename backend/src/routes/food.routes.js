import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { searchFoods } from "../controllers/mealController.js";

const router = Router();

router.get("/search", protect, searchFoods);

export default router;
