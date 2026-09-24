import express from 'express';
import { getStudentProfile, updateStudentProfile, getCollegeStudents, createStudent } from '../controllers/studentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles, requireStudentAccess } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/', requireRoles('COLLEGE_ADMIN', 'SUPER_ADMIN'), getCollegeStudents);
router.post('/', requireRoles('COLLEGE_ADMIN', 'SUPER_ADMIN'), createStudent);
router.get('/profile', getStudentProfile);
router.get('/:id', requireStudentAccess, getStudentProfile);
router.put('/:id', requireStudentAccess, updateStudentProfile);
router.patch('/:id', requireStudentAccess, updateStudentProfile);

export default router;
