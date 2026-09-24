import express from 'express';
import { getDocuments, getDocumentById, uploadDocument, downloadDocument, viewDocument, recordPhysicalCertificateIssue, deleteDocument } from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles, requireDocumentAccess } from '../middleware/rbac.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/upload', requireRoles('COLLEGE_ADMIN', 'SUPER_ADMIN'), upload.single('file'), uploadDocument);

// Document specific endpoints
router.get('/:id', requireDocumentAccess, getDocumentById);
router.get('/:id/download', requireDocumentAccess, downloadDocument);
router.get('/:id/view', requireDocumentAccess, viewDocument);
router.post('/:id/physical-issue', requireRoles('COLLEGE_ADMIN', 'SUPER_ADMIN'), recordPhysicalCertificateIssue);
router.delete('/:id', requireRoles('COLLEGE_ADMIN', 'SUPER_ADMIN'), deleteDocument);

export default router;
