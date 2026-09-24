import express from 'express';
import { getGlobalStats, getSystemAuditLogs, getSystemSettings, updateSystemSettings } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/stats', requireRoles('SUPER_ADMIN', 'COLLEGE_ADMIN'), getGlobalStats);
router.get('/audit-logs', requireRoles('SUPER_ADMIN'), getSystemAuditLogs);
router.get('/settings', requireRoles('SUPER_ADMIN'), getSystemSettings);
router.put('/settings', requireRoles('SUPER_ADMIN'), updateSystemSettings);

export default router;
