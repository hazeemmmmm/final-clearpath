import { Router } from "express";
import * as supervisorController from "./supervisor.controller.js";
import { authMiddleware, allowTo } from "../../middleware/auth.middleware.js";

const router = Router();

// Specialized recommendation endpoint (can be called by authenticated users/admin)
router.post("/recommend", authMiddleware, supervisorController.recommendSupervisors);

// CRUD routes for supervisor management
router.post("/", authMiddleware, allowTo("admin"), supervisorController.createSupervisor);
router.get("/", authMiddleware, supervisorController.getAllSupervisors);

export default router;
