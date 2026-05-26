import { Router } from 'express';
const router = Router();
import * as paymentController from './payment.controller.js';
import * as schema from './payment.validation.js';
import { isValid } from '../../middleware/validation.middleware.js';
import { authMiddleware, allowTo } from '../../middleware/auth.middleware.js';

// Create a PayPal order for a pending booking (Mapped to Stripe Checkout Session)
router.post(
    '/create-order',
    authMiddleware,
    isValid(schema.createOrderSchema),
    paymentController.createOrder
);

// Capture the payment after user approves on PayPal (Mapped to Stripe Session Capture)
router.post(
    '/capture/:orderId',
    authMiddleware,
    isValid(schema.captureOrderSchema),
    paymentController.captureOrder
);

// Bank Transfer payment — confirm booking directly
router.post(
    '/bank-pay',
    authMiddleware,
    isValid(schema.createOrderSchema),
    paymentController.bankPay
);

// PayPal webhook — no auth
router.post('/webhook', paymentController.webhook);

// Get logged-in user's payment history
router.get('/history', authMiddleware, paymentController.getPaymentHistory);

// Get all payments (Admin)
router.get('/admin/all', authMiddleware, allowTo('admin'), paymentController.getAllPaymentsAdmin);

export default router;

