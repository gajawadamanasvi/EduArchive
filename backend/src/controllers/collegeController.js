import db from '../config/db.js';
import { logAudit } from '../services/auditService.js';

export const getAllColleges = async (req, res) => {
  try {
    const { status, search } = req.query;
    let colleges = db.find('colleges');

    if (status) {
      colleges = colleges.filter(c => c.verification_status === status.toUpperCase());
    }

    if (search) {
      const q = search.toLowerCase();
      colleges = colleges.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.college_code && c.college_code.toLowerCase().includes(q)) ||
        (c.university && c.university.toLowerCase().includes(q))
      );
    }

    // Attach student & document counts to each college
    const enriched = colleges.map(college => {
      const studentCount = db.count('students', s => String(s.college_id) === String(college.id));
      const docCount = db.count('documents', d => String(d.college_id) === String(college.id));
      const verifiedDocCount = db.count('documents', d => String(d.college_id) === String(college.id) && d.status === 'VERIFIED');
      return {
        ...college,
        studentCount,
        docCount,
        verifiedDocCount
      };
    });

    return res.json({ success: true, count: enriched.length, colleges: enriched });
  } catch (error) {
    console.error('[GetAllColleges Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch colleges.' });
  }
};

export const getCollegeById = async (req, res) => {
  try {
    const college = db.findById('colleges', req.params.id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found.' });
    }

    const studentCount = db.count('students', s => String(s.college_id) === String(college.id));
    const docCount = db.count('documents', d => String(d.college_id) === String(college.id));
    const verifiedDocCount = db.count('documents', d => String(d.college_id) === String(college.id) && d.status === 'VERIFIED');
    const pendingDocCount = db.count('documents', d => String(d.college_id) === String(college.id) && (d.status === 'PENDING' || d.status === 'NEEDS_REVIEW'));

    return res.json({
      success: true,
      college: {
        ...college,
        stats: {
          totalStudents: studentCount,
          totalDocuments: docCount,
          verifiedDocuments: verifiedDocCount,
          pendingDocuments: pendingDocCount
        }
      }
    });
  } catch (error) {
    console.error('[GetCollegeById Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve college.' });
  }
};

export const createCollege = async (req, res) => {
  try {
    const { name, college_code, address, email, phone, website, university } = req.body;

    if (!name || !college_code || !email) {
      return res.status(400).json({ success: false, message: 'College name, code, and official email are required.' });
    }

    const existing = db.findOne('colleges', c => c.college_code.toUpperCase() === college_code.toUpperCase() || c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'A college with this code or email already exists.' });
    }

    const newCollege = db.insert('colleges', {
      name,
      college_code: college_code.toUpperCase(),
      address: address || '',
      email: email.toLowerCase(),
      phone: phone || '',
      website: website || '',
      university: university || 'State University',
      verification_status: 'PENDING', // default pending until Super Admin verifies
      verified_at: null,
      verified_by: null,
      logo_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(college_code)}`
    });

    await logAudit({
      userId: req.user.id,
      action: 'COLLEGE_CREATED',
      entityType: 'COLLEGE',
      entityId: newCollege.id,
      details: { name, code: college_code },
      ipAddress: req.ip
    });

    return res.status(201).json({ success: true, message: 'College created successfully.', college: newCollege });
  } catch (error) {
    console.error('[CreateCollege Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create college.' });
  }
};

export const updateCollegeVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'VERIFIED', 'PENDING', 'SUSPENDED'

    if (!['VERIFIED', 'PENDING', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status.' });
    }

    const college = db.findById('colleges', id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College record not found.' });
    }

    const updates = {
      verification_status: status,
      verified_at: status === 'VERIFIED' ? new Date().toISOString() : null,
      verified_by: status === 'VERIFIED' ? req.user.id : null
    };

    const updatedCollege = db.update('colleges', id, updates);

    await logAudit({
      userId: req.user.id,
      action: status === 'VERIFIED' ? 'COLLEGE_VERIFIED_BADGE_GRANTED' : 'COLLEGE_STATUS_UPDATED',
      entityType: 'COLLEGE',
      entityId: id,
      details: { previousStatus: college.verification_status, newStatus: status, collegeName: college.name },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: status === 'VERIFIED' ? 'Institution granted "✓ Verified College" badge.' : `College status updated to ${status}.`,
      college: updatedCollege
    });
  } catch (error) {
    console.error('[UpdateCollegeVerificationStatus Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update verification status.' });
  }
};

export const updateCollegeProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const college = db.findById('colleges', id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found.' });
    }

    if (req.user.role === 'COLLEGE_ADMIN' && String(req.user.college_id) !== String(id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot edit another college profile.' });
    }

    const { name, address, phone, website, university, logo_url } = req.body;
    const updates = {
      name: name || college.name,
      address: address !== undefined ? address : college.address,
      phone: phone !== undefined ? phone : college.phone,
      website: website !== undefined ? website : college.website,
      university: university !== undefined ? university : college.university,
      logo_url: logo_url || college.logo_url
    };

    const updated = db.update('colleges', id, updates);

    await logAudit({
      userId: req.user.id,
      action: 'COLLEGE_PROFILE_UPDATED',
      entityType: 'COLLEGE',
      entityId: id,
      details: updates,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'College profile updated successfully.', college: updated });
  } catch (error) {
    console.error('[UpdateCollegeProfile Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update college profile.' });
  }
};
