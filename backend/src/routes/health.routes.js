import { Router } from "express";

import {
  calculate,
  history,
  statistics,
} from "../controllers/healthController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);
router.post("/calculate", calculate);
router.get("/history", history);
router.get("/statistics", statistics);

export default router;
