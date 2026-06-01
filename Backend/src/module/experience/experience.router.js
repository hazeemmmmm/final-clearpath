import { Router } from "express";
import      experienceController from "./experience.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { allowTo } from "../../middleware/auth.middleware.js";

const router = Router();
//  PUBLIC ROUTES

//  Get all experiences (search + filter + pagination)
router.get("/", experienceController.getAll);

// Supervisor can see all assigned trips and booking metrics
router.get("/supervisor/me", authMiddleware, allowTo("supervisor"), experienceController.getSupervisorTrips);

//  Get Filter Options
router.get("/filter-options", experienceController.getFilterOptions);

//  Get Extensions starting the next day for trip chaining
router.get("/extensions", experienceController.getExtensions);

//  Get one experience
router.get("/:id", experienceController.getOne);


//  ADMIN ROUTES

// Create experience
router.post(
  "/",
  authMiddleware,
  allowTo("admin"),
  experienceController.create
);

// Update experience
router.patch(
  "/:id",
  authMiddleware,
  allowTo("admin"),
  experienceController.update
);


// Duplicate experience
router.post(
  "/:id/duplicate",
  authMiddleware,
  allowTo("admin"),
  experienceController.duplicate
);

//  Delete experience
router.delete(
  "/:id",
  authMiddleware,
  allowTo("admin"),
  experienceController.delete
);

// 🧠 Smart Provider Match (Admin)
router.get(
  "/:id/providers-match",
  authMiddleware,
  allowTo("admin"),
  experienceController.getProvidersMatch
);

// 📝 Assign Guide (Admin)
router.patch(
  "/:id/assign-guide",
  authMiddleware,
  allowTo("admin"),
  experienceController.assignGuide
);

// 📝 Auto-Assign Guide Yasmine (Admin)
router.patch(
  "/:id/auto-assign-guide",
  authMiddleware,
  allowTo("admin"),
  experienceController.autoAssignGuide
);

// 🌟 Toggle Featured (Admin)
router.patch(
  "/:id/featured",
  authMiddleware,
  allowTo("admin"),
  experienceController.toggleFeatured
);

// 🧠 AI pricing optimization (Admin)
router.get(
  "/:id/optimize-price",
  authMiddleware,
  allowTo("admin"),
  experienceController.optimizePrice
);

router.patch(
  "/:id/apply-optimized-price",
  authMiddleware,
  allowTo("admin"),
  experienceController.applyOptimizedPrice
);

export default router;