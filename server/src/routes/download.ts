import { Router } from 'express';
import { downloadResume, resendDownloadLink } from '../controllers/downloadController';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.get(
  '/:token',
  [param('token').notEmpty().withMessage('Download token is required')],
  validateRequest,
  downloadResume
);

router.post(
  '/resend',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('templateName').optional().isString(),
  ],
  validateRequest,
  resendDownloadLink
);

export default router;
