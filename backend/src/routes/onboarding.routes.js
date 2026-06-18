import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { completeOnboarding, getUserProfile } from "../controllers/onboardingController.js";

const router = Router();

router.use(protect);

router.post("/complete", completeOnboarding);
router.get("/profile", getUserProfile);

export default router;
