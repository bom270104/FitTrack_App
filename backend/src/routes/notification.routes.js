import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getSetting, upsertSetting, deleteSetting, sendTestEmail } from "../controllers/notificationController.js";

const router = Router();

router.use(protect);
router.get("/", getSetting);
router.post("/", upsertSetting);
router.post("/test-email", sendTestEmail);
router.delete("/", deleteSetting);

export default router;
