import express from 'express';
import { createDocumentRequest, getDocumentRequests, processDocumentRequest } from '../controllers/requestController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDocumentRequests);
router.post('/', requireRoles('STUDENT'), upload.single('file'), createDocumentRequest);
router.patch('/:id/process', requireRoles('COLLEGE_ADMIN', 'SUPER_ADMIN'), processDocumentRequest);

export default router;
