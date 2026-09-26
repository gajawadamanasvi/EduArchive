import db from '../../config/db.js';
import { logAIAuditEvent } from './auditTools.js';

/**
 * Controlled Student Tools
 * Authoritatively retrieves student profiles with RBAC security constraints.
 */

export const getStudentProfileTool = async ({ caller, targetStudentId = null, rollNumber = null }) => {
  try {
    if (!caller || !caller.userId) {
      return {
        success: false,
        error: 'ACCESS_DENIED: Unauthenticated caller context.',
        code: 'UNAUTHENTICATED'
      };
    }

    let student = null;

    // 1. If caller is STUDENT, force target to be caller's own student record
    if (caller.userRole === 'STUDENT') {
      student = db.findOne('students', s => String(s.user_id) === String(caller.userId));
      if (!student && caller.studentId) {
        student = db.findById('students', caller.studentId);
      }
    } else if (targetStudentId) {
      student = db.findById('students', targetStudentId);
    } else if (rollNumber) {
      student = db.findOne('students', s => (s.roll_number || '').toLowerCase() === rollNumber.trim().toLowerCase());
    }

    if (!student) {
      return {
        success: false,
        error: 'Student record not found.',
        code: 'NOT_FOUND'
      };
    }

    // 2. RBAC Access Control Check
    if (caller.userRole === 'STUDENT') {
      if (String(student.user_id) !== String(caller.userId) && String(student.id) !== String(caller.studentId)) {
        await logAIAuditEvent({
          userId: caller.userId,
          action: 'AI_AGENT_SECURITY_VIOLATION_BLOCKED',
          entityType: 'STUDENT',
          entityId: targetStudentId || rollNumber,
          details: { reason: 'Unauthorized attempt to access another student profile' }
        });
        return {
          success: false,
          error: 'ACCESS_DENIED: You are not authorized to view this student profile.',
          code: 'FORBIDDEN'
        };
      }
    } else if (caller.userRole === 'COLLEGE_ADMIN') {
      if (caller.userCollegeId && String(student.college_id) !== String(caller.userCollegeId)) {
        return {
          success: false,
          error: 'ACCESS_DENIED: Student does not belong to your institution.',
          code: 'FORBIDDEN'
        };
      }
    }

    // Return sanitized structured details
    const fullStudent = db.getStudentWithDetails(student.id);

    await logAIAuditEvent({
      userId: caller.userId,
      action: 'AI_TOOL_EXECUTED',
      entityType: 'STUDENT',
      entityId: student.id,
      details: { tool: 'getStudentProfileTool', role: caller.userRole }
    });

    return {
      success: true,
      data: {
        id: fullStudent.id,
        name: fullStudent.user?.name || 'Unknown',
        email: fullStudent.user?.email || '',
        rollNumber: fullStudent.roll_number,
        studentIdNumber: fullStudent.student_id_number,
        course: fullStudent.course,
        department: fullStudent.department,
        admissionYear: fullStudent.admission_year,
        graduationYear: fullStudent.graduation_year,
        collegeId: fullStudent.college_id,
        collegeName: fullStudent.college?.name || 'Authorized Institution',
        status: fullStudent.status
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: 'INTERNAL_ERROR'
    };
  }
};
