import { Router } from "express";

import { calculate, history } from "../controllers/caloriesController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);
router.post("/calculate", calculate);
router.get("/history", history);

export default router;