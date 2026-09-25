import fs from 'fs';
import path from 'path';
import db from '../config/db.js';
import { logAudit } from '../services/auditService.js';
import { getTelanganaCollegeIds } from '../utils/jurisdiction.js';

export const createDocumentRequest = async (req, res) => {
  try {
    const { document_type, reason, urgent = false, document_id = null } = req.body;

    if (!document_type || !reason) {
      return res.status(400).json({ success: false, message: 'Document Type and Reason are required.' });
    }

    if (req.user.role !== 'STUDENT' || !req.student) {
      return res.status(403).json({ success: false, message: 'Only registered students can submit document retrieval requests.' });
    }

    let filePath = '';
    let fileName = '';
    let fileSize = 0;
    let mimeType = '';

    if (req.file) {
      filePath = req.file.path;
      fileName = req.file.filename;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
    }

    const newRequest = db.insert('document_requests', {
      student_id: req.student.id,
      college_id: req.student.college_id,
      document_id: document_id || null,
      document_type,
      reason,
      urgent: Boolean(urgent === 'true' || urgent === true),
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
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
      details: { document_type, reason, college_id: req.student.college_id, fileName },
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
      const telanganaCollegeIds = getTelanganaCollegeIds();
      requests = requests.filter(r => telanganaCollegeIds.has(String(r.college_id)));
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
      
      let document = null;
      if (r.document_id) {
        document = db.getDocumentWithDetails(r.document_id);
      }
      
      // If approved or issued but document_id wasn't set, find or link matching document
      if (!document && (r.request_status === 'APPROVED' || r.request_status === 'ISSUED')) {
        const matchingDoc = db.find('documents').find(d => 
          String(d.student_id) === String(r.student_id) && 
          d.document_type?.toLowerCase() === r.document_type?.toLowerCase()
        );
        if (matchingDoc) {
          document = db.getDocumentWithDetails(matchingDoc.id);
          db.update('document_requests', r.id, { document_id: matchingDoc.id });
        }
      }

      return {
        ...r,
        document,
        document_id: document?.id || r.document_id || null,
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

    let linkedDocId = requestItem.document_id;

    // When approving or issuing, ensure a corresponding official document exists in the student's repository
    if (status === 'APPROVED' || status === 'ISSUED') {
      const student = db.getStudentWithDetails(requestItem.student_id);
      
      if (linkedDocId) {
        // Update existing document if needed
        const updateData = {
          status: status === 'ISSUED' ? 'PHYSICAL_ISSUED' : 'VERIFIED',
          custody_status: status === 'ISSUED' ? 'ISSUED_TO_STUDENT' : 'STORED_IN_COLLEGE_REPOSITORY'
        };
        if (requestItem.file_path && fs.existsSync(requestItem.file_path)) {
          updateData.file_path = requestItem.file_path;
          updateData.file_name = requestItem.file_name;
          updateData.mime_type = requestItem.mime_type;
          updateData.file_size = requestItem.file_size;
        }
        db.update('documents', linkedDocId, updateData);
      } else {
        // Search if matching doc exists
        const existingDoc = db.find('documents').find(d => 
          String(d.student_id) === String(requestItem.student_id) && 
          d.document_type?.toLowerCase() === requestItem.document_type?.toLowerCase()
        );

        if (existingDoc) {
          linkedDocId = existingDoc.id;
          const updateData = {
            status: status === 'ISSUED' ? 'PHYSICAL_ISSUED' : 'VERIFIED',
            custody_status: status === 'ISSUED' ? 'ISSUED_TO_STUDENT' : 'STORED_IN_COLLEGE_REPOSITORY'
          };
          if (requestItem.file_path && fs.existsSync(requestItem.file_path)) {
            updateData.file_path = requestItem.file_path;
            updateData.file_name = requestItem.file_name;
            updateData.mime_type = requestItem.mime_type;
            updateData.file_size = requestItem.file_size;
          }
          db.update('documents', existingDoc.id, updateData);
        } else {
          // Generate new verified official document
          const hasUploadedFile = Boolean(requestItem.file_path && fs.existsSync(requestItem.file_path));
          const fileExt = hasUploadedFile ? path.extname(requestItem.file_path) : '.pdf';
          const defaultFileName = `${requestItem.document_type.replace(/\s+/g, '_')}_${student?.roll_number || 'STU'}${fileExt}`;
          
          let inferredMime = 'application/pdf';
          if (hasUploadedFile && requestItem.mime_type) {
            inferredMime = requestItem.mime_type;
          } else if (fileExt === '.png') {
            inferredMime = 'image/png';
          } else if (fileExt === '.jpg' || fileExt === '.jpeg') {
            inferredMime = 'image/jpeg';
          }

          const newDoc = db.insert('documents', {
            student_id: requestItem.student_id,
            college_id: requestItem.college_id,
            document_type: requestItem.document_type,
            title: `${requestItem.document_type} - ${student?.name || 'Student'}`,
            file_path: hasUploadedFile ? requestItem.file_path : '',
            file_name: hasUploadedFile ? requestItem.file_name : defaultFileName,
            file_size: hasUploadedFile ? requestItem.file_size : 245000,
            mime_type: inferredMime,
            status: status === 'ISSUED' ? 'PHYSICAL_ISSUED' : 'VERIFIED',
            is_original: true,
            custody_status: status === 'ISSUED' ? 'ISSUED_TO_STUDENT' : 'STORED_IN_COLLEGE_REPOSITORY',
            locker_reference: 'College Academic Repository / Approved Request',
            date_deposited: new Date().toISOString(),
            physical_issue_details: status === 'ISSUED' ? {
              issued_to: student?.name || 'Student',
              issued_date: new Date().toISOString().split('T')[0],
              issued_by_admin_id: req.user.id,
              issued_by_admin_name: req.user.name,
              remark: remarks || 'Official physical certificate issued upon request approval',
              return_expected_date: 'N/A',
              is_returned: false
            } : null,
            uploaded_by: req.user.id,
            upload_date: new Date().toISOString()
          });

          linkedDocId = newDoc.id;
        }
      }
    }

    const updated = db.update('document_requests', id, {
      request_status: status,
      document_id: linkedDocId,
      remarks: remarks || `Request marked as ${status} by ${req.user.name}.`,
      processed_by: req.user.id
    });

    await logAudit({
      userId: req.user.id,
      action: `DOCUMENT_REQUEST_${status}`,
      entityType: 'DOCUMENT_REQUEST',
      entityId: id,
      details: { previousStatus: requestItem.request_status, newStatus: status, remarks, document_id: linkedDocId },
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
