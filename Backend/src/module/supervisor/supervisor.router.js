import { Router } from "express";
import * as supervisorController from "./supervisor.controller.js";
import { authMiddleware, allowTo } from "../../middleware/auth.middleware.js";

import { matchSupervisorByBio } from "./aiSupervisorController.js";

const router = Router();

// AI Bio-Analysis matching endpoint
router.post("/ai-match", authMiddleware, matchSupervisorByBio);

// Specialized recommendation endpoint (can be called by authenticated users/admin)
router.post("/recommend", authMiddleware, supervisorController.recommendSupervisors);

// CRUD routes for supervisor management
router.post("/", authMiddleware, allowTo("admin"), supervisorController.createSupervisor);
router.get("/", authMiddleware, supervisorController.getAllSupervisors);

export default router;
