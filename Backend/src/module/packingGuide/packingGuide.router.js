import { Router } from 'express';
import packingGuideController from './packingGuide.controller.js';
import { authMiddleware, allowTo } from '../../middleware/auth.middleware.js';

const router = Router();

// ── PUBLIC ─────────────────────────────────────────────────────
// Smart lookup: returns the best packing guide for a given experience
router.get('/for/:experienceId', packingGuideController.getForExperience);

// ── ADMIN ONLY ──────────────────────────────────────────────────
// Get all packing guides
router.get(
  '/',
  authMiddleware,
  allowTo('admin'),
  packingGuideController.getAll
);

// Get one packing guide by ID
router.get(
  '/:id',
  authMiddleware,
  allowTo('admin'),
  packingGuideController.getOne
);

// Create a new packing guide
router.post(
  '/',
  authMiddleware,
  allowTo('admin'),
  packingGuideController.create
);

// Update a packing guide
router.patch(
  '/:id',
  authMiddleware,
  allowTo('admin'),
  packingGuideController.update
);

// Delete a packing guide
router.delete(
  '/:id',
  authMiddleware,
  allowTo('admin'),
  packingGuideController.delete
);

export default router;
