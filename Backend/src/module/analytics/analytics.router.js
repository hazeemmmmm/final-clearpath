import { Router } from "express";
import { trackInteraction } from "./analytics.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

// Track user interactions (Requires Authentication)
router.post("/track", authMiddleware, trackInteraction);

export default router;
