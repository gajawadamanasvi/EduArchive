import express from 'express';
import { getAllColleges, getCollegeById, createCollege, updateCollegeVerificationStatus, updateCollegeProfile } from '../controllers/collegeController.js';
import { authenticate, authenticateOptional } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = express.Router();

// Public / Authenticated read (with optional user extraction)
router.get('/', authenticateOptional, getAllColleges);
router.get('/:id', authenticateOptional, getCollegeById);

// Protected routes
router.use(authenticate);
router.post('/', requireRoles('SUPER_ADMIN'), createCollege);
router.put('/:id', requireRoles('COLLEGE_ADMIN', 'SUPER_ADMIN'), updateCollegeProfile);
router.patch('/:id/verify', requireRoles('SUPER_ADMIN'), updateCollegeVerificationStatus);

export default router;
