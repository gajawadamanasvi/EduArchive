import path from 'path';
import fs from 'fs';
import db from '../config/db.js';
import { logAudit } from '../services/auditService.js';
import { verifyDocumentWithAI } from '../ai/verificationAgent.js';
import { getTelanganaCollegeIds } from '../utils/jurisdiction.js';

export const getDocuments = async (req, res) => {
  try {
    const { status, student_id, college_id, type, search } = req.query;
    let docs = db.find('documents');

    // 1. Role-based isolation
    if (req.user.role === 'STUDENT') {
      if (!req.student) {
        return res.status(404).json({ success: false, message: 'Student profile not linked.' });
      }
      docs = docs.filter(d => String(d.student_id) === String(req.student.id));
    } else if (req.user.role === 'COLLEGE_ADMIN') {
      docs = docs.filter(d => String(d.college_id) === String(req.user.college_id));
      if (student_id) {
        docs = docs.filter(d => String(d.student_id) === String(student_id));
      }
    } else if (req.user.role === 'SUPER_ADMIN') {
      const telanganaCollegeIds = getTelanganaCollegeIds();
      docs = docs.filter(d => telanganaCollegeIds.has(String(d.college_id)));
      if (college_id) {
        docs = docs.filter(d => String(d.college_id) === String(college_id));
      }
      if (student_id) {
        docs = docs.filter(d => String(d.student_id) === String(student_id));
      }
    }

    // 2. Filter parameters
    if (status) {
      docs = docs.filter(d => d.status.toUpperCase() === status.toUpperCase());
    }
    if (type) {
      docs = docs.filter(d => d.document_type.toLowerCase() === type.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(d => 
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.document_type && d.document_type.toLowerCase().includes(q)) ||
        (d.file_name && d.file_name.toLowerCase().includes(q))
      );
    }

    const enriched = docs.map(d => db.getDocumentWithDetails(d.id));

    return res.json({
      success: true,
      count: enriched.length,
      documents: enriched
    });
  } catch (error) {
    console.error('[GetDocuments Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve documents.' });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    // req.targetDocument was verified by requireDocumentAccess middleware
    const doc = db.getDocumentWithDetails(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    return res.json({ success: true, document: doc });
  } catch (error) {
    console.error('[GetDocumentById Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve document details.' });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    let { 
      student_id, 
      document_type, 
      title, 
      remarks, 
      run_ai_verification = 'true',
      is_original = false,
      custody_status = 'STORED_IN_COLLEGE_REPOSITORY',
      locker_reference = ''
    } = req.body;

    if (req.user.role === 'STUDENT') {
      if (!req.student) {
        return res.status(403).json({ success: false, message: 'Student profile not found.' });
      }
      student_id = req.student.id;
    }

    if (!student_id || !document_type) {
      return res.status(400).json({ success: false, message: 'Student ID and Document Type are required.' });
    }

    const student = db.getStudentWithDetails(student_id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    // Authorization check for College Admin
    if (req.user.role === 'COLLEGE_ADMIN' && String(student.college_id) !== String(req.user.college_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot upload documents for another college student.' });
    }

    let filePath = '';
    let fileName = '';
    let fileSize = 0;
    let mimeType = 'application/pdf';

    if (req.file) {
      filePath = req.file.path;
      fileName = req.file.filename;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
    } else {
      fileName = `${document_type.replace(/\s+/g, '_')}_${student.roll_number || 'DOC'}.pdf`;
      filePath = '';
      fileSize = 245000;
      mimeType = 'application/pdf';
    }

    const collegeId = student.college_id || req.user.college_id;

    // Create Document record
    const newDoc = db.insert('documents', {
      student_id: student.id,
      college_id: collegeId,
      document_type,
      title: title || `${document_type} - ${student.user?.name || student.name || 'Student'}`,
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      status: req.user.role === 'STUDENT' ? 'PENDING' : 'VERIFIED',
      is_original: Boolean(is_original === 'true' || is_original === true),
      custody_status: custody_status || 'STORED_IN_COLLEGE_REPOSITORY',
      locker_reference: locker_reference || 'College Academic Repository / Safe Vault',
      date_deposited: new Date().toISOString(),
      physical_issue_details: null,
      uploaded_by: req.user.id,
      upload_date: new Date().toISOString()
    });

    let aiResult = null;
    if (run_ai_verification === 'true' || run_ai_verification === true) {
      try {
        aiResult = await verifyDocumentWithAI({
          documentId: newDoc.id,
          filePath,
          fileName,
          documentType: document_type,
          studentId: student.id,
          collegeId
        });

        // Create verification record
        db.insert('verification_records', {
          document_id: newDoc.id,
          verified_by: req.user.id,
          verification_status: aiResult.classification === 'CONSISTENT' ? 'AI_CONSISTENT' : 'NEEDS_REVIEW',
          remarks: aiResult.recommendation,
          ai_result: aiResult,
          verified_at: new Date().toISOString()
        });

        // If high confidence, flag as NEEDS_REVIEW for fast one-click approval by admin
        if (aiResult.classification === 'CONSISTENT') {
          db.update('documents', newDoc.id, { status: 'PENDING' });
        }
      } catch (aiErr) {
        console.warn('[AI Verification Warning]:', aiErr.message);
      }
    }

    await logAudit({
      userId: req.user.id,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'DOCUMENT',
      entityId: newDoc.id,
      details: { student_id, document_type, fileName, aiClassification: aiResult?.classification },
      ipAddress: req.ip
    });

    const fullDoc = db.getDocumentWithDetails(newDoc.id);
    return res.status(201).json({
      success: true,
      message: 'Certificate uploaded and queued for verification.',
      document: fullDoc,
      aiResult
    });
  } catch (error) {
    console.error('[UploadDocument Error]:', error);
    return res.status(500).json({ success: false, message: 'Error uploading certificate.' });
  }
};

function escapeXml(unsafe) {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const downloadDocument = async (req, res) => {
  try {
    const doc = db.findById('documents', req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document record not found.' });
    }

    await logAudit({
      userId: req.user.id,
      action: 'DOCUMENT_DOWNLOADED',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      details: { title: doc.title, document_type: doc.document_type },
      ipAddress: req.ip
    });

    // Check if actual file exists on disk, if not serve dynamic digital certificate representation
    if (doc.file_path && fs.existsSync(doc.file_path)) {
      const fileName = doc.file_name || `${(doc.document_type || 'Document').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      return res.download(path.resolve(doc.file_path), fileName);
    }

    // Serve rich verifiable SVG certificate stream
    const fullDoc = db.getDocumentWithDetails(doc.id);
    const svgCert = generateVerifiableCertificateSVG(fullDoc);

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${(doc.document_type || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_')}_Verified.svg"`);
    return res.send(svgCert);
  } catch (error) {
    console.error('[DownloadDocument Error]:', error);
    return res.status(500).json({ success: false, message: 'Error downloading document.' });
  }
};

export const viewDocument = async (req, res) => {
  try {
    const doc = db.getDocumentWithDetails(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (doc.file_path && fs.existsSync(doc.file_path)) {
      const ext = path.extname(doc.file_path).toLowerCase();
      if (ext === '.pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (ext === '.svg') {
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      } else if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
      } else if (ext === '.jpg' || ext === '.jpeg') {
        res.setHeader('Content-Type', 'image/jpeg');
      }
      return res.sendFile(path.resolve(doc.file_path));
    }

    // Return verifiable SVG graphic representation
    const svgCert = generateVerifiableCertificateSVG(doc);
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    return res.send(svgCert);
  } catch (error) {
    console.error('[ViewDocument Error]:', error);
    return res.status(500).json({ success: false, message: 'Error rendering certificate view.' });
  }
};

export const recordPhysicalCertificateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { issued_to, issued_date, remark, return_expected_date, action_type = 'ISSUE' } = req.body;

    const doc = db.findById('documents', id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (req.user.role === 'COLLEGE_ADMIN' && String(doc.college_id) !== String(req.user.college_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot manage documents of another institution.' });
    }

    let updatedStatus = 'PHYSICAL_ISSUED';
    let physicalDetails = null;

    if (action_type === 'RETURN') {
      updatedStatus = 'VERIFIED';
      physicalDetails = {
        ...doc.physical_issue_details,
        is_returned: true,
        returned_date: new Date().toISOString().split('T')[0],
        return_remark: remark || 'Physical certificate safely returned to college archive.'
      };
    } else {
      physicalDetails = {
        issued_to: issued_to || 'Student',
        issued_date: issued_date || new Date().toISOString().split('T')[0],
        issued_by_admin_id: req.user.id,
        issued_by_admin_name: req.user.name,
        remark: remark || 'Certificate temporarily issued to student upon verified request.',
        return_expected_date: return_expected_date || 'N/A',
        is_returned: false
      };
    }

    const updatedDoc = db.update('documents', id, {
      status: updatedStatus,
      physical_issue_details: physicalDetails
    });

    await logAudit({
      userId: req.user.id,
      action: action_type === 'RETURN' ? 'PHYSICAL_CERTIFICATE_RETURNED' : 'PHYSICAL_CERTIFICATE_ISSUED',
      entityType: 'DOCUMENT',
      entityId: id,
      details: {
        docTitle: doc.title,
        previousStatus: doc.status,
        newStatus: updatedStatus,
        physicalDetails
      },
      ipAddress: req.ip
    });

    const fullDoc = db.getDocumentWithDetails(id);
    return res.json({
      success: true,
      message: action_type === 'RETURN' ? 'Physical certificate return logged.' : 'Physical certificate issuance logged in digital repository.',
      document: fullDoc
    });
  } catch (error) {
    console.error('[RecordPhysicalIssue Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to record physical certificate status.' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = db.findById('documents', id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Role check: Students are strictly blocked from deleting certificates
    if (req.user.role === 'STUDENT') {
      return res.status(403).json({ success: false, message: 'Security Policy: Students are not permitted to delete official certificate records.' });
    }

    if (req.user.role === 'COLLEGE_ADMIN' && String(doc.college_id) !== String(req.user.college_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot delete documents of another college.' });
    }

    db.delete('documents', id);

    await logAudit({
      userId: req.user.id,
      action: 'DOCUMENT_DELETED',
      entityType: 'DOCUMENT',
      entityId: id,
      details: { title: doc.title, student_id: doc.student_id },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Document removed from repository.' });
  } catch (error) {
    console.error('[DeleteDocument Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete document.' });
  }
};

// Generates an official cryptographic-style SVG certificate watermark
function generateVerifiableCertificateSVG(doc) {
  const studentName = escapeXml(doc.student?.name || 'Student Name');
  const rollNo = escapeXml(doc.student?.roll_number || 'REG-2024-001');
  const studentIdNumber = escapeXml(doc.student?.student_id_number || 'STU-2024');
  const collegeName = escapeXml(doc.college?.name || 'Accredited Academic Institution');
  const university = escapeXml(doc.college?.university || 'State Technical University');
  const degree = escapeXml(doc.student?.course || doc.document_type || 'Academic Degree');
  const docType = escapeXml(doc.document_type || 'ACADEMIC CERTIFICATE');
  const department = escapeXml(doc.student?.department || 'Engineering');
  const academicYear = escapeXml(doc.student?.academic_year || '2022-2026');
  const status = doc.status || 'VERIFIED';
  const isVerified = status === 'VERIFIED';
  const docId = escapeXml(doc.id || 'DOC-VERIFIED');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>

  <!-- Certificate Background & Border -->
  <rect width="1000" height="700" fill="url(#bgGrad)"/>
  <rect x="25" y="25" width="950" height="650" fill="none" stroke="#0f172a" stroke-width="4"/>
  <rect x="35" y="35" width="930" height="630" fill="none" stroke="#d97706" stroke-width="1.5" stroke-dasharray="8,4"/>

  <!-- Watermark Stamp -->
  <g transform="translate(500, 350) rotate(-25)" opacity="0.10">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="64" font-weight="900" fill="#0f172a" text-anchor="middle">
      AUTHENTICATED ACADEMIC RECORD
    </text>
  </g>

  <!-- Header & Institution -->
  <text x="500" y="100" font-family="'Times New Roman', Georgia, serif" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="2">
    ${collegeName.toUpperCase()}
  </text>
  <text x="500" y="130" font-family="Arial, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">
    Affiliated to ${university} • Accredited Academic Institution
  </text>

  <!-- Certificate Title -->
  <line x1="250" y1="160" x2="750" y2="160" stroke="#d97706" stroke-width="2"/>
  <text x="500" y="210" font-family="'Times New Roman', Georgia, serif" font-size="32" font-weight="bold" fill="#1e293b" text-anchor="middle">
    ${docType.toUpperCase()}
  </text>
  <text x="500" y="245" font-family="Georgia, serif" font-style="italic" font-size="16" fill="#475569" text-anchor="middle">
    This is to officially certify that
  </text>

  <!-- Student Name & Details -->
  <text x="500" y="300" font-family="'Times New Roman', Georgia, serif" font-size="36" font-weight="bold" fill="#0369a1" text-anchor="middle">
    ${studentName}
  </text>
  <text x="500" y="335" font-family="Arial, sans-serif" font-size="16" fill="#334155" text-anchor="middle">
    Roll No: ${rollNo} | Student ID: ${studentIdNumber}
  </text>

  <text x="500" y="380" font-family="Georgia, serif" font-size="18" fill="#334155" text-anchor="middle">
    has fulfilled all the curriculum requirements for the award of
  </text>
  <text x="500" y="420" font-family="'Times New Roman', Georgia, serif" font-size="26" font-weight="bold" fill="#0f172a" text-anchor="middle">
    ${degree}
  </text>
  <text x="500" y="455" font-family="Arial, sans-serif" font-size="15" fill="#64748b" text-anchor="middle">
    Department of ${department} • Academic Session ${academicYear}
  </text>

  <!-- Verification Badge Box -->
  <g transform="translate(100, 520)">
    <rect width="260" height="90" rx="8" fill="${isVerified ? '#f0fdf4' : '#fffbeb'}" stroke="${isVerified ? '#22c55e' : '#f59e0b'}" stroke-width="1.5"/>
    <text x="20" y="32" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${isVerified ? '#15803d' : '#b45309'}">
      ${isVerified ? '✓ VERIFIED DIGITAL RECORD' : '⏳ PENDING VERIFICATION'}
    </text>
    <text x="20" y="55" font-family="Arial, sans-serif" font-size="11" fill="#64748b">
      Doc ID: ${docId}
    </text>
    <text x="20" y="73" font-family="Arial, sans-serif" font-size="11" fill="#64748b">
      Status: ${escapeXml(status)}
    </text>
  </g>

  <!-- Official Signatures -->
  <g transform="translate(680, 530)">
    <line x1="0" y1="50" x2="220" y2="50" stroke="#334155" stroke-width="1.5"/>
    <text x="110" y="40" font-family="'Brush Script MT', cursive, serif" font-size="24" fill="#0f172a" text-anchor="middle">
      Dr. R. K. Sharma
    </text>
    <text x="110" y="72" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">
      Registrar / Controller of Exams
    </text>
    <text x="110" y="90" font-family="Arial, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">
      ${collegeName}
    </text>
  </g>
</svg>`;
}
