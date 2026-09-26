import db from '../config/db.js';
import { logAudit } from '../services/auditService.js';
import { verifyDocumentWithAI } from '../ai/verificationAgent.js';
import { runEduArchiveWorkflow } from '../agents/index.js';

export const runAIVerificationScan = async (req, res) => {
  try {
    const { document_id, custom_ocr_text } = req.body;
    if (!document_id) {
      return res.status(400).json({ success: false, message: 'Document ID is required.' });
    }

    const doc = db.findById('documents', document_id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (req.user.role === 'COLLEGE_ADMIN' && String(doc.college_id) !== String(req.user.college_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot scan documents from another college.' });
    }

    // 1. Run LangGraph Workflow
    let aiResult;
    try {
      const graphResult = await runEduArchiveWorkflow({
        userId: req.user.id,
        userRole: req.user.role,
        userName: req.user.name,
        userCollegeId: req.user.college_id,
        studentId: doc.student_id,
        documentId: doc.id,
        documentType: doc.document_type,
        fileName: doc.file_name,
        rawOcrText: custom_ocr_text,
        userRequest: `Verify document ${doc.file_name} for student ${doc.student_id}`
      });

      if (graphResult.success && graphResult.verificationResult) {
        const v = graphResult.verificationResult;
        const anom = graphResult.anomalyResult || {};
        aiResult = {
          verifiedAt: new Date().toISOString(),
          confidenceScore: Math.round((v.confidence || 0.8) * 100),
          classification: v.status === 'VERIFIED' ? 'CONSISTENT' : (v.status === 'MISMATCH' ? 'SUSPICIOUS_MISMATCH' : 'NEEDS_MANUAL_REVIEW'),
          statusBadge: v.status === 'VERIFIED' ? 'CONSISTENT' : (v.status === 'MISMATCH' ? 'SUSPICIOUS' : 'NEEDS_REVIEW'),
          ocrTextSnippet: custom_ocr_text ? (custom_ocr_text.substring(0, 500) + (custom_ocr_text.length > 500 ? '...' : '')) : 'Simulated OCR stream verified.',
          extractedFields: graphResult.extractedData || {},
          fieldChecks: v.fieldChecks || [],
          recommendation: v.recommendation || 'Document analysis completed.',
          anomalyRisk: anom.riskLevel || 'LOW',
          criticDecision: graphResult.criticResult?.decision || 'APPROVE',
          requiresHumanReview: graphResult.requiresHumanReview || false,
          workflowSteps: graphResult.steps || [],
          disclaimer: 'LangGraph Multi-Agent Document Verification Pipeline. Final authority rests with institutional administrators.'
        };
      }
    } catch (graphErr) {
      console.warn('[LangGraph Verification Warn]: Reverting to base verification engine:', graphErr.message);
    }

    // Fallback to direct verification engine if graphResult was null
    if (!aiResult) {
      aiResult = await verifyDocumentWithAI({
        documentId: doc.id,
        filePath: doc.file_path,
        fileName: doc.file_name,
        documentType: doc.document_type,
        studentId: doc.student_id,
        collegeId: doc.college_id,
        customOcrText: custom_ocr_text
      });
    }

    // Save verification log
    const existingVerif = db.findOne('verification_records', v => String(v.document_id) === String(doc.id));
    let verifRecord;

    if (existingVerif) {
      verifRecord = db.update('verification_records', existingVerif.id, {
        verified_by: req.user.id,
        ai_result: aiResult,
        remarks: aiResult.recommendation,
        verified_at: new Date().toISOString()
      });
    } else {
      verifRecord = db.insert('verification_records', {
        document_id: doc.id,
        verified_by: req.user.id,
        verification_status: aiResult.classification === 'CONSISTENT' ? 'AI_CONSISTENT' : 'NEEDS_REVIEW',
        remarks: aiResult.recommendation,
        ai_result: aiResult,
        verified_at: new Date().toISOString()
      });
    }

    await logAudit({
      userId: req.user.id,
      action: 'AI_OCR_VERIFICATION_PERFORMED',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      details: {
        score: aiResult.confidenceScore,
        classification: aiResult.classification
      },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'AI Document Verification scan completed.',
      aiResult,
      verificationRecord: verifRecord
    });
  } catch (error) {
    console.error('[RunAIVerificationScan Error]:', error);
    return res.status(500).json({ success: false, message: 'AI verification failed.' });
  }
};

export const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params; // document_id
    const { status, remarks } = req.body; // 'VERIFIED', 'REJECTED', 'NEEDS_REVIEW'

    if (!['VERIFIED', 'REJECTED', 'NEEDS_REVIEW', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status.' });
    }

    const doc = db.findById('documents', id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Role check: Students can NEVER verify certificates
    if (req.user.role === 'STUDENT') {
      return res.status(403).json({ success: false, message: 'Security Policy: Students are not authorized to change verification status.' });
    }

    if (req.user.role === 'COLLEGE_ADMIN' && String(doc.college_id) !== String(req.user.college_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot verify documents from another institution.' });
    }

    // Update document status
    const updatedDoc = db.update('documents', id, { status });

    // Update or insert verification record
    const existingVerif = db.findOne('verification_records', v => String(v.document_id) === String(doc.id));
    if (existingVerif) {
      db.update('verification_records', existingVerif.id, {
        verified_by: req.user.id,
        verification_status: status,
        remarks: remarks || `Status officially updated to ${status} by ${req.user.name}.`,
        verified_at: new Date().toISOString()
      });
    } else {
      db.insert('verification_records', {
        document_id: doc.id,
        verified_by: req.user.id,
        verification_status: status,
        remarks: remarks || `Status officially updated to ${status} by ${req.user.name}.`,
        ai_result: null,
        verified_at: new Date().toISOString()
      });
    }

    await logAudit({
      userId: req.user.id,
      action: status === 'VERIFIED' ? 'DOCUMENT_VERIFIED' : (status === 'REJECTED' ? 'DOCUMENT_REJECTED' : 'DOCUMENT_STATUS_CHANGED'),
      entityType: 'DOCUMENT',
      entityId: id,
      details: { previousStatus: doc.status, newStatus: status, remarks },
      ipAddress: req.ip
    });

    const fullDoc = db.getDocumentWithDetails(id);
    return res.json({
      success: true,
      message: `Document status successfully updated to ${status}.`,
      document: fullDoc
    });
  } catch (error) {
    console.error('[UpdateVerificationStatus Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update verification status.' });
  }
};

export const getVerificationHistory = async (req, res) => {
  try {
    const { documentId } = req.params;
    const records = db.find('verification_records', v => String(v.document_id) === String(documentId));

    const enriched = records.map(r => {
      const verifier = db.findById('users', r.verified_by);
      return {
        ...r,
        verifier_name: verifier ? verifier.name : 'Automated System Agent',
        verifier_role: verifier ? verifier.role : 'SYSTEM'
      };
    });

    return res.json({ success: true, count: enriched.length, records: enriched });
  } catch (error) {
    console.error('[GetVerificationHistory Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve verification history.' });
  }
};
