import express from 'express';
import { runAIVerificationScan, updateVerificationStatus, getVerificationHistory } from '../controllers/verificationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.post('/scan', requireRoles('COLLEGE_ADMIN', 'SUPER_ADMIN'), runAIVerificationScan);
router.patch('/:id/status', requireRoles('COLLEGE_ADMIN', 'SUPER_ADMIN'), updateVerificationStatus);
router.get('/:documentId/history', getVerificationHistory);

export default router;
