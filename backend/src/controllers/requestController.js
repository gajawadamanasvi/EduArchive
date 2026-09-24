import db from '../config/db.js';
import { logAudit } from '../services/auditService.js';

export const createDocumentRequest = async (req, res) => {
  try {
    const { document_type, reason, urgent = false, document_id = null } = req.body;

    if (!document_type || !reason) {
      return res.status(400).json({ success: false, message: 'Document Type and Reason are required.' });
    }

    if (req.user.role !== 'STUDENT' || !req.student) {
      return res.status(403).json({ success: false, message: 'Only registered students can submit document retrieval requests.' });
    }

    const newRequest = db.insert('document_requests', {
      student_id: req.student.id,
      college_id: req.student.college_id,
      document_id: document_id || null,
      document_type,
      reason,
      urgent: Boolean(urgent),
      request_status: 'PENDING', // PENDING, APPROVED, REJECTED, ISSUED
      processed_by: null,
      remarks: null,
      request_date: new Date().toISOString()
    });

    await logAudit({
      userId: req.user.id,
      action: 'DOCUMENT_REQUEST_SUBMITTED',
      entityType: 'DOCUMENT_REQUEST',
      entityId: newRequest.id,
      details: { document_type, reason, college_id: req.student.college_id },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Document retrieval request submitted successfully.',
      request: newRequest
    });
  } catch (error) {
    console.error('[CreateDocumentRequest Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create document request.' });
  }
};

export const getDocumentRequests = async (req, res) => {
  try {
    const { status, student_id, college_id } = req.query;
    let requests = db.find('document_requests');

    if (req.user.role === 'STUDENT') {
      requests = requests.filter(r => String(r.student_id) === String(req.student?.id));
    } else if (req.user.role === 'COLLEGE_ADMIN') {
      requests = requests.filter(r => String(r.college_id) === String(req.user.college_id));
      if (student_id) {
        requests = requests.filter(r => String(r.student_id) === String(student_id));
      }
    } else if (req.user.role === 'SUPER_ADMIN') {
      if (college_id) requests = requests.filter(r => String(r.college_id) === String(college_id));
      if (student_id) requests = requests.filter(r => String(r.student_id) === String(student_id));
    }

    if (status) {
      requests = requests.filter(r => r.request_status.toUpperCase() === status.toUpperCase());
    }

    const enriched = requests.map(r => {
      const student = db.getStudentWithDetails(r.student_id);
      const college = db.findById('colleges', r.college_id);
      const processor = r.processed_by ? db.findById('users', r.processed_by) : null;
      return {
        ...r,
        student,
        college,
        processor_name: processor ? processor.name : null
      };
    });

    return res.json({ success: true, count: enriched.length, requests: enriched });
  } catch (error) {
    console.error('[GetDocumentRequests Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve document requests.' });
  }
};

export const processDocumentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // 'APPROVED', 'REJECTED', 'ISSUED'

    if (!['APPROVED', 'REJECTED', 'ISSUED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid request status.' });
    }

    const requestItem = db.findById('document_requests', id);
    if (!requestItem) {
      return res.status(404).json({ success: false, message: 'Document request not found.' });
    }

    if (req.user.role === 'COLLEGE_ADMIN' && String(requestItem.college_id) !== String(req.user.college_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot process requests for another college.' });
    }

    const updated = db.update('document_requests', id, {
      request_status: status,
      remarks: remarks || `Request marked as ${status} by ${req.user.name}.`,
      processed_by: req.user.id
    });

    await logAudit({
      userId: req.user.id,
      action: `DOCUMENT_REQUEST_${status}`,
      entityType: 'DOCUMENT_REQUEST',
      entityId: id,
      details: { previousStatus: requestItem.request_status, newStatus: status, remarks },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Document request updated to ${status}.`,
      request: updated
    });
  } catch (error) {
    console.error('[ProcessDocumentRequest Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to process document request.' });
  }
};
