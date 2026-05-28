import { Router } from "express";
import * as adminController from "./admin.controller.js";
import { authMiddleware, allowTo } from "../../middleware/auth.middleware.js";

const router = Router();

// Get Intelligence Flags
router.get("/intelligence", authMiddleware, allowTo("admin"), adminController.getIntelligenceDashboard);

export default router;
