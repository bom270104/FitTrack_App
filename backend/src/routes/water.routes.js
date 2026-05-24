import { Router } from "express";

import {
  create,
  today,
  history,
  remove,
} from "../controllers/waterController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);
router.post("/", create);
router.get("/today", today);
router.get("/history", history);
router.delete("/:id", remove);

export default router;
