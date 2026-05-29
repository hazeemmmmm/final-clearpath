import { Router } from "express";
import * as adminController from "./admin.controller.js";
import { authMiddleware, allowTo } from "../../middleware/auth.middleware.js";

const router = Router();

// Get Intelligence Flags
router.get("/intelligence", authMiddleware, allowTo("admin"), adminController.getIntelligenceDashboard);

// Suspend/Flag User Account
router.patch("/flag-user/:userId", authMiddleware, allowTo("admin"), adminController.flagUser);
router.patch("/unflag-user/:userId", authMiddleware, allowTo("admin"), adminController.unflagUser);

export default router;
