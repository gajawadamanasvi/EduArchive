import { processChatQuery, getSuggestedQuestions } from '../ai/chatbotService.js';
import { verifyDocumentWithAI } from '../ai/verificationAgent.js';
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
      actions: []
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

    const aiResult = await verifyDocumentWithAI({
      documentId: 'simulation_test',
      filePath: '',
      fileName: file_name || 'test_scan.pdf',
      documentType: document_type || 'Degree Certificate',
      studentId: student.id,
      collegeId: student.college_id,
      customOcrText: sample_text
    });

    return res.json({
      success: true,
      aiResult
    });
  } catch (error) {
    console.error('[RunDirectScan Error]:', error);
    return res.status(500).json({ success: false, message: 'Scan failed.' });
  }
};
