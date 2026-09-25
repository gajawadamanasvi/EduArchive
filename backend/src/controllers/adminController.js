import db from '../config/db.js';
import { getAuditLogs, logAudit } from '../services/auditService.js';
import { isTelanganaCollege, getTelanganaCollegeIds } from '../utils/jurisdiction.js';

export const getGlobalStats = async (req, res) => {
  try {
    const telanganaCollegeIds = getTelanganaCollegeIds();
    const telanganaColleges = db.find('colleges', isTelanganaCollege);

    const totalColleges = telanganaColleges.length;
    const verifiedColleges = telanganaColleges.filter(c => c.verification_status === 'VERIFIED').length;

    const telanganaStudents = db.find('students', s => telanganaCollegeIds.has(String(s.college_id)));
    const telanganaStudentUserIds = new Set(telanganaStudents.map(s => String(s.user_id)));
    const telanganaStudentIds = new Set(telanganaStudents.map(s => String(s.id)));

    // College admin users in Telangana
    const telanganaAdminUsers = db.find('users', u => u.college_id && telanganaCollegeIds.has(String(u.college_id)));
    const totalUsers = telanganaStudents.length + telanganaAdminUsers.length + 1; // +1 for Super Admin

    const telanganaDocs = db.find('documents', d => 
      telanganaCollegeIds.has(String(d.college_id)) || telanganaStudentIds.has(String(d.student_id))
    );

    const totalDocuments = telanganaDocs.length;
    const verifiedDocuments = telanganaDocs.filter(d => d.status === 'VERIFIED').length;
    const pendingDocuments = telanganaDocs.filter(d => d.status === 'PENDING' || d.status === 'NEEDS_REVIEW').length;
    const rejectedDocuments = telanganaDocs.filter(d => d.status === 'REJECTED').length;

    const telanganaRequests = db.find('document_requests', r => 
      telanganaCollegeIds.has(String(r.college_id)) || telanganaStudentIds.has(String(r.student_id))
    );

    const totalRequests = telanganaRequests.length;
    const pendingRequests = telanganaRequests.filter(r => r.request_status === 'PENDING').length;

    return res.json({
      success: true,
      jurisdiction: 'TELANGANA_STATE',
      state: 'Telangana',
      stats: {
        totalUsers,
        totalStudents: telanganaStudents.length,
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
