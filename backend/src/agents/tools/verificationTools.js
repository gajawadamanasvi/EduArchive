import db from '../../config/db.js';
import { logAIAuditEvent } from './auditTools.js';

/**
 * Controlled Verification & Request Tools
 * Allows agents to inspect verification status and pending applications authoritatively.
 */

export const getPendingRequestsTool = async ({ caller, studentId = null }) => {
  try {
    if (!caller || !caller.userId) {
      return { success: false, error: 'ACCESS_DENIED: Unauthenticated caller.', code: 'UNAUTHENTICATED' };
    }

    let requests = [];

    if (caller.userRole === 'STUDENT') {
      const studentRec = db.findOne('students', s => String(s.user_id) === String(caller.userId));
      if (!studentRec) return { success: true, data: { count: 0, requests: [] } };
      requests = db.find('document_requests', r => String(r.student_id) === String(studentRec.id));
    } else if (caller.userRole === 'COLLEGE_ADMIN') {
      requests = db.find('document_requests', r => String(r.college_id) === String(caller.userCollegeId));
    } else {
      requests = db.find('document_requests', () => true);
    }

    const formatted = requests.map(r => {
      const student = db.getStudentWithDetails(r.student_id);
      return {
        id: r.id,
        documentType: r.document_type,
        purpose: r.purpose,
        status: r.status,
        requestedAt: r.requested_at,
        studentName: student?.user?.name || 'Student',
        studentRoll: student?.roll_number || 'N/A'
      };
    });

    await logAIAuditEvent({
      userId: caller.userId,
      action: 'AI_TOOL_EXECUTED',
      entityType: 'REQUEST',
      entityId: caller.userId,
      details: { tool: 'getPendingRequestsTool', count: formatted.length }
    });

    return {
      success: true,
      data: {
        totalCount: formatted.length,
        requests: formatted
      }
    };
  } catch (error) {
    return { success: false, error: error.message, code: 'INTERNAL_ERROR' };
  }
};

export const getVerificationHistoryTool = async ({ caller, documentId }) => {
  try {
    if (!caller || !caller.userId) {
      return { success: false, error: 'ACCESS_DENIED: Unauthenticated caller.', code: 'UNAUTHENTICATED' };
    }

    if (!documentId) {
      return { success: false, error: 'Document ID is required.', code: 'INVALID_INPUT' };
    }

    const doc = db.findById('documents', documentId);
    if (!doc) {
      return { success: false, error: 'Document not found.', code: 'NOT_FOUND' };
    }

    // Role check
    if (caller.userRole === 'STUDENT') {
      const studentRec = db.findOne('students', s => String(s.user_id) === String(caller.userId));
      if (!studentRec || String(doc.student_id) !== String(studentRec.id)) {
        return { success: false, error: 'ACCESS_DENIED: Cannot view other student records.', code: 'FORBIDDEN' };
      }
    }

    const records = db.find('verification_records', v => String(v.document_id) === String(documentId));
    const enriched = records.map(r => {
      const verifier = db.findById('users', r.verified_by);
      return {
        id: r.id,
        status: r.verification_status,
        remarks: r.remarks,
        verifiedAt: r.verified_at,
        verifierName: verifier ? verifier.name : 'AI Automation Agent',
        verifierRole: verifier ? verifier.role : 'SYSTEM'
      };
    });

    return {
      success: true,
      data: {
        documentId,
        historyCount: enriched.length,
        records: enriched
      }
    };
  } catch (error) {
    return { success: false, error: error.message, code: 'INTERNAL_ERROR' };
  }
};
