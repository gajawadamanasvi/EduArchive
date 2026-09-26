import { processChatQuery, getSuggestedQuestions } from '../ai/chatbotService.js';
import { verifyDocumentWithAI } from '../ai/verificationAgent.js';
import { runEduArchiveWorkflow } from '../agents/index.js';
import db from '../config/db.js';

export const handleChatQuery = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user || null;
    const student = req.student || (user?.role === 'STUDENT' ? db.findOne('students', s => String(s.user_id) === String(user.id)) : null);

    const result = await processChatQuery({
      message,
      user,
      student
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[AI Chatbot Error]:', error);
    return res.status(500).json({
      success: false,
      reply: 'An issue occurred processing your query. Please try again shortly.',
      actions: [],
      steps: []
    });
  }
};

export const fetchSuggestedQuestions = async (req, res) => {
  try {
    const role = req.user?.role || 'STUDENT';
    const questions = getSuggestedQuestions(role);
    return res.json({ success: true, questions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve suggestions.' });
  }
};

export const runDirectScan = async (req, res) => {
  try {
    const { student_id, document_type, sample_text, file_name } = req.body;

    const student = db.getStudentWithDetails(student_id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    // 1. Run LangGraph Workflow
    let aiResult;
    try {
      const graphResult = await runEduArchiveWorkflow({
        userId: req.user?.id || 'DIRECT_SCAN_USER',
        userRole: req.user?.role || 'COLLEGE_ADMIN',
        userName: req.user?.name || 'Authorized Reviewer',
        userCollegeId: student.college_id,
        studentId: student.id,
        documentId: 'simulation_test',
        documentType: document_type || 'Degree Certificate',
        fileName: file_name || 'test_scan.pdf',
        rawOcrText: sample_text,
        userRequest: `Direct scan analysis for student ${student.id}`
      });

      if (graphResult.success && graphResult.verificationResult) {
        const v = graphResult.verificationResult;
        const anom = graphResult.anomalyResult || {};
        aiResult = {
          verifiedAt: new Date().toISOString(),
          confidenceScore: Math.round((v.confidence || 0.8) * 100),
          classification: v.status === 'VERIFIED' ? 'CONSISTENT' : (v.status === 'MISMATCH' ? 'SUSPICIOUS_MISMATCH' : 'NEEDS_MANUAL_REVIEW'),
          statusBadge: v.status === 'VERIFIED' ? 'CONSISTENT' : (v.status === 'MISMATCH' ? 'SUSPICIOUS' : 'NEEDS_REVIEW'),
          ocrTextSnippet: sample_text ? (sample_text.substring(0, 500) + (sample_text.length > 500 ? '...' : '')) : 'Direct OCR scan verified.',
          extractedFields: graphResult.extractedData || {},
          fieldChecks: v.fieldChecks || [],
          recommendation: v.recommendation || 'Document analysis completed.',
          anomalyRisk: anom.riskLevel || 'LOW',
          criticDecision: graphResult.criticResult?.decision || 'APPROVE',
          requiresHumanReview: graphResult.requiresHumanReview || false,
          workflowSteps: graphResult.steps || [],
          disclaimer: 'LangGraph Multi-Agent Document Verification Pipeline. Final authority rests with issuing institution.'
        };
      }
    } catch (graphErr) {
      console.warn('[LangGraph Direct Scan Warn]: Reverting to base engine:', graphErr.message);
    }

    if (!aiResult) {
      aiResult = await verifyDocumentWithAI({
        documentId: 'simulation_test',
        filePath: '',
        fileName: file_name || 'test_scan.pdf',
        documentType: document_type || 'Degree Certificate',
        studentId: student.id,
        collegeId: student.college_id,
        customOcrText: sample_text
      });
    }

    return res.json({
      success: true,
      aiResult
    });
  } catch (error) {
    console.error('[RunDirectScan Error]:', error);
    return res.status(500).json({ success: false, message: 'Scan failed.' });
  }
};
