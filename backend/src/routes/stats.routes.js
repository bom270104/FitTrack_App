import { Router } from "express";

import { dashboard } from "../controllers/statsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/dashboard", dashboard);

export default router;