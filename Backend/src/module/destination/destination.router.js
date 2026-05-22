import { Router } from 'express';
const router = Router();
import * as destController from './destination.controller.js';
import * as destValidation from './destination.validation.js';
import { isValid as validation } from '../../middleware/validation.middleware.js';
import { authMiddleware, allowTo } from '../../middleware/auth.middleware.js';

// --- public routes (Tourists) ---
router.get('/', destController.getDestinations);
router.get('/:destinationId', validation(destValidation.getByIdSchema, 'params'), destController.getOneDestination);

// --- admin routes (Admin only) ---
router.post('/', 
    authMiddleware,
    allowTo('admin'),
    validation(destValidation.destinationSchema), 
    destController.addDestination
);

router.patch('/:destinationId', 
    authMiddleware,
    allowTo('admin'),
    validation(destValidation.getByIdSchema, 'params'), 
    validation(destValidation.destinationSchema), 
    destController.updateDestination
);

router.delete('/:destinationId', 
    authMiddleware,
    allowTo('admin'),
    validation(destValidation.getByIdSchema, 'params'), 
    destController.removeDestination
);

export default router;