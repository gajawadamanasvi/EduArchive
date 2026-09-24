import { verifyToken } from '../utils/security.js';
import db from '../config/db.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Missing or invalid authorization token.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Token has expired or is invalid.'
      });
    }

    const user = db.findById('users', decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: User account not found.'
      });
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account Suspended: Please contact platform administrator.'
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      college_id: user.college_id || null
    };

    // If student, attach student record
    if (user.role === 'STUDENT') {
      const student = db.findOne('students', s => String(s.user_id) === String(user.id));
      if (student) {
        req.student = student;
        req.user.student_id = student.id;
        req.user.college_id = student.college_id;
      }
    }

    next();
  } catch (err) {
    console.error('[Auth Middleware] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error during authentication.'
    });
  }
};
