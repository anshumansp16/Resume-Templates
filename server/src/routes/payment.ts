import { Router } from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post(
  '/create-order',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('resumeData').notEmpty().withMessage('Resume data is required'),
    body('templateId').notEmpty().withMessage('Template ID is required'),
    body('templateName').optional().isString(),
  ],
  validateRequest,
  createPaymentOrder
);

router.post(
  '/verify',
  [
    body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Signature is required'),
    body('templateName').optional().isString(),
  ],
  validateRequest,
  verifyPayment
);

export default router;
