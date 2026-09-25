import db from '../config/db.js';
import { isTelanganaCollege } from '../utils/jurisdiction.js';

export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

export const requireDocumentAccess = (req, res, next) => {
  try {
    const docId = req.params.id || req.params.documentId;
    const document = db.findById('documents', docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    // SUPER_ADMIN has access scoped to Telangana colleges
    if (req.user.role === 'SUPER_ADMIN') {
      const docCollege = db.findById('colleges', document.college_id);
      if (docCollege && !isTelanganaCollege(docCollege)) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Main Administrator has access to Telangana colleges only.'
        });
      }
      req.targetDocument = document;
      return next();
    }

    // COLLEGE_ADMIN can only access documents belonging to their college
    if (req.user.role === 'COLLEGE_ADMIN') {
      if (String(document.college_id) !== String(req.user.college_id)) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You do not have permission to access documents from another college.'
        });
      }
      req.targetDocument = document;
      return next();
    }

    // STUDENT can only access their own documents
    if (req.user.role === 'STUDENT') {
      if (!req.student || String(document.student_id) !== String(req.student.id)) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not authorized to view or download certificates belonging to another student.'
        });
      }
      req.targetDocument = document;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access Denied: Unauthorized role.'
    });
  } catch (err) {
    console.error('[RBAC Doc Access Error]:', err);
    return res.status(500).json({ success: false, message: 'Internal server error evaluating document authorization.' });
  }
};

export const requireStudentAccess = (req, res, next) => {
  try {
    const studentId = req.params.id || req.params.studentId;
    const student = db.findById('students', studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      const studentCollege = db.findById('colleges', student.college_id);
      if (studentCollege && !isTelanganaCollege(studentCollege)) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Main Administrator has access to Telangana colleges only.'
        });
      }
      req.targetStudent = student;
      return next();
    }

    if (req.user.role === 'COLLEGE_ADMIN') {
      if (String(student.college_id) !== String(req.user.college_id)) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Student belongs to a different institution.'
        });
      }
      req.targetStudent = student;
      return next();
    }

    if (req.user.role === 'STUDENT') {
      if (!req.student || String(student.id) !== String(req.student.id)) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You can only access your own student profile.'
        });
      }
      req.targetStudent = student;
      return next();
    }

    return res.status(403).json({ success: false, message: 'Access Denied.' });
  } catch (err) {
    console.error('[RBAC Student Access Error]:', err);
    return res.status(500).json({ success: false, message: 'Internal server error evaluating student authorization.' });
  }
};
