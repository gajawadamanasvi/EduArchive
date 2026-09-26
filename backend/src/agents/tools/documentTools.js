import db from '../../config/db.js';
import { logAIAuditEvent } from './auditTools.js';

/**
 * Controlled Document Tools
 * Authoritatively retrieves document records with strict caller verification.
 */

export const getStudentDocumentsTool = async ({ caller, targetStudentId = null, filterStatus = null }) => {
  try {
    if (!caller || !caller.userId) {
      return { success: false, error: 'ACCESS_DENIED: Unauthenticated caller.', code: 'UNAUTHENTICATED' };
    }

    let effectiveStudentId = targetStudentId;

    if (caller.userRole === 'STUDENT') {
      const studentRec = db.findOne('students', s => String(s.user_id) === String(caller.userId));
      if (!studentRec) {
        return { success: false, error: 'Student profile not linked to user account.', code: 'NOT_FOUND' };
      }
      effectiveStudentId = studentRec.id;
    }

    if (!effectiveStudentId) {
      return { success: false, error: 'Target student ID is required.', code: 'INVALID_INPUT' };
    }

    // Role-based security validation
    if (caller.userRole === 'STUDENT' && String(caller.studentId || effectiveStudentId) !== String(effectiveStudentId)) {
      await logAIAuditEvent({
        userId: caller.userId,
        action: 'AI_AGENT_SECURITY_VIOLATION_BLOCKED',
        entityType: 'DOCUMENT',
        entityId: effectiveStudentId,
        details: { reason: 'Student attempted cross-student document access' }
      });
      return { success: false, error: 'ACCESS_DENIED: Cross-student document access forbidden.', code: 'FORBIDDEN' };
    }

    const docs = db.find('documents', d => {
      if (String(d.student_id) !== String(effectiveStudentId)) return false;
      if (filterStatus && d.status !== filterStatus) return false;
      return true;
    });

    const enriched = docs.map(d => {
      const full = db.getDocumentWithDetails(d.id);
      return {
        id: full.id,
        documentType: full.document_type,
        fileName: full.file_name,
        status: full.status,
        issuedDate: full.issued_date,
        isPhysicalIssued: full.is_physical_issued,
        collegeName: full.college?.name || 'Institution',
        verifiedAt: full.verification?.verified_at || null
      };
    });

    await logAIAuditEvent({
      userId: caller.userId,
      action: 'AI_TOOL_EXECUTED',
      entityType: 'DOCUMENT',
      entityId: effectiveStudentId,
      details: { tool: 'getStudentDocumentsTool', count: enriched.length }
    });

    return {
      success: true,
      data: {
        totalCount: enriched.length,
        documents: enriched
      }
    };
  } catch (error) {
    return { success: false, error: error.message, code: 'INTERNAL_ERROR' };
  }
};

export const getDocumentDetailsTool = async ({ caller, documentId }) => {
  try {
    if (!caller || !caller.userId) {
      return { success: false, error: 'ACCESS_DENIED: Unauthenticated caller.', code: 'UNAUTHENTICATED' };
    }

    if (!documentId) {
      return { success: false, error: 'Document ID is required.', code: 'INVALID_INPUT' };
    }

    const doc = db.getDocumentWithDetails(documentId);
    if (!doc) {
      return { success: false, error: 'Document not found.', code: 'NOT_FOUND' };
    }

    // RBAC validation
    if (caller.userRole === 'STUDENT') {
      const studentRec = db.findOne('students', s => String(s.user_id) === String(caller.userId));
      if (!studentRec || String(doc.student_id) !== String(studentRec.id)) {
        await logAIAuditEvent({
          userId: caller.userId,
          action: 'AI_AGENT_SECURITY_VIOLATION_BLOCKED',
          entityType: 'DOCUMENT',
          entityId: documentId,
          details: { reason: 'Unauthorized document access attempt' }
        });
        return { success: false, error: 'ACCESS_DENIED: You do not own this document.', code: 'FORBIDDEN' };
      }
    } else if (caller.userRole === 'COLLEGE_ADMIN') {
      if (caller.userCollegeId && String(doc.college_id) !== String(caller.userCollegeId)) {
        return { success: false, error: 'ACCESS_DENIED: Document belongs to a different institution.', code: 'FORBIDDEN' };
      }
    }

    await logAIAuditEvent({
      userId: caller.userId,
      action: 'AI_TOOL_EXECUTED',
      entityType: 'DOCUMENT',
      entityId: documentId,
      details: { tool: 'getDocumentDetailsTool' }
    });

    return {
      success: true,
      data: {
        id: doc.id,
        documentType: doc.document_type,
        fileName: doc.file_name,
        fileSize: doc.file_size,
        status: doc.status,
        issuedDate: doc.issued_date,
        studentName: doc.student?.name || 'Student',
        studentRoll: doc.student?.roll_number || 'N/A',
        collegeName: doc.college?.name || 'Institution',
        verification: doc.verification ? {
          status: doc.verification.verification_status,
          remarks: doc.verification.remarks,
          verifiedAt: doc.verification.verified_at
        } : null
      }
    };
  } catch (error) {
    return { success: false, error: error.message, code: 'INTERNAL_ERROR' };
  }
};

export const searchDocumentsTool = async ({ caller, queryText, documentType = null }) => {
  try {
    if (!caller || !caller.userId) {
      return { success: false, error: 'ACCESS_DENIED: Unauthenticated caller.', code: 'UNAUTHENTICATED' };
    }

    const q = (queryText || '').toLowerCase();

    let docs = [];
    if (caller.userRole === 'STUDENT') {
      const studentRec = db.findOne('students', s => String(s.user_id) === String(caller.userId));
      if (!studentRec) return { success: true, data: { count: 0, results: [] } };
      docs = db.find('documents', d => String(d.student_id) === String(studentRec.id));
    } else if (caller.userRole === 'COLLEGE_ADMIN') {
      docs = db.find('documents', d => String(d.college_id) === String(caller.userCollegeId));
    } else {
      docs = db.find('documents', () => true);
    }

    const filtered = docs.filter(d => {
      if (documentType && !d.document_type.toLowerCase().includes(documentType.toLowerCase())) {
        return false;
      }
      if (!q) return true;
      const typeMatch = (d.document_type || '').toLowerCase().includes(q);
      const nameMatch = (d.file_name || '').toLowerCase().includes(q);
      return typeMatch || nameMatch;
    });

    const results = filtered.map(d => ({
      id: d.id,
      documentType: d.document_type,
      fileName: d.file_name,
      status: d.status,
      issuedDate: d.issued_date
    }));

    return {
      success: true,
      data: {
        count: results.length,
        results
      }
    };
  } catch (error) {
    return { success: false, error: error.message, code: 'INTERNAL_ERROR' };
  }
};
