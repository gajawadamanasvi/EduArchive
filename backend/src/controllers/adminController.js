import db from '../config/db.js';
import { getAuditLogs, logAudit } from '../services/auditService.js';

export const getGlobalStats = async (req, res) => {
  try {
    const totalUsers = db.count('users');
    const totalStudents = db.count('students');
    const totalColleges = db.count('colleges');
    const verifiedColleges = db.count('colleges', c => c.verification_status === 'VERIFIED');
    const totalDocuments = db.count('documents');
    const verifiedDocuments = db.count('documents', d => d.status === 'VERIFIED');
    const pendingDocuments = db.count('documents', d => d.status === 'PENDING' || d.status === 'NEEDS_REVIEW');
    const rejectedDocuments = db.count('documents', d => d.status === 'REJECTED');
    const totalRequests = db.count('document_requests');
    const pendingRequests = db.count('document_requests', r => r.request_status === 'PENDING');

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalColleges,
        verifiedColleges,
        pendingColleges: totalColleges - verifiedColleges,
        totalDocuments,
        verifiedDocuments,
        pendingDocuments,
        rejectedDocuments,
        totalRequests,
        pendingRequests
      }
    });
  } catch (error) {
    console.error('[GetGlobalStats Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve system statistics.' });
  }
};

export const getSystemAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '100', 10);
    const logs = getAuditLogs(limit);
    return res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error('[GetSystemAuditLogs Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
};

export const getSystemSettings = async (req, res) => {
  try {
    const settings = db.data.settings || {};
    return res.json({ success: true, settings });
  } catch (error) {
    console.error('[GetSystemSettings Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    const newSettings = req.body;
    db.data.settings = { ...db.data.settings, ...newSettings };
    db.save();

    await logAudit({
      userId: req.user.id,
      action: 'SYSTEM_SETTINGS_UPDATED',
      entityType: 'SETTINGS',
      details: newSettings,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Platform settings saved.', settings: db.data.settings });
  } catch (error) {
    console.error('[UpdateSystemSettings Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
};
