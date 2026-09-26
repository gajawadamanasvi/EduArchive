import db from '../config/db.js';
import { logAudit } from '../services/auditService.js';
import { isTelanganaCollege } from '../utils/jurisdiction.js';
import { hashPassword } from '../utils/security.js';

export const getAllColleges = async (req, res) => {
  try {
    const { status, search, state } = req.query;
    let colleges = db.find('colleges');

    // Main Admin (SUPER_ADMIN) has access restricted only to Telangana colleges
    if (req.user?.role === 'SUPER_ADMIN' || state?.toLowerCase() === 'telangana') {
      colleges = colleges.filter(isTelanganaCollege);
    }

    if (status) {
      colleges = colleges.filter(c => c.verification_status === status.toUpperCase());
    }

    if (search) {
      const q = search.toLowerCase();
      colleges = colleges.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.college_code && c.college_code.toLowerCase().includes(q)) ||
        (c.university && c.university.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    }

    // Attach student & document counts to each college
    const enriched = colleges.map(college => {
      const studentCount = db.count('students', s => String(s.college_id) === String(college.id));
      const docCount = db.count('documents', d => String(d.college_id) === String(college.id));
      const verifiedDocCount = db.count('documents', d => String(d.college_id) === String(college.id) && d.status === 'VERIFIED');
      return {
        ...college,
        state: college.state || 'Telangana',
        studentCount,
        docCount,
        verifiedDocCount
      };
    });

    return res.json({ 
      success: true, 
      count: enriched.length, 
      jurisdiction: req.user?.role === 'SUPER_ADMIN' ? 'TELANGANA_STATE' : undefined,
      colleges: enriched 
    });
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

    // Main Admin is restricted to Telangana colleges only
    if (req.user?.role === 'SUPER_ADMIN' && !isTelanganaCollege(college)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Main Administrator authority is restricted to Telangana colleges only.'
      });
    }

    const studentCount = db.count('students', s => String(s.college_id) === String(college.id));
    const docCount = db.count('documents', d => String(d.college_id) === String(college.id));
    const verifiedDocCount = db.count('documents', d => String(d.college_id) === String(college.id) && d.status === 'VERIFIED');
    const pendingDocCount = db.count('documents', d => String(d.college_id) === String(college.id) && (d.status === 'PENDING' || d.status === 'NEEDS_REVIEW'));

    return res.json({
      success: true,
      college: {
        ...college,
        state: college.state || 'Telangana',
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
    const { 
      name, 
      college_code, 
      address, 
      email, 
      phone, 
      website, 
      university, 
      state,
      admin_name,
      admin_email,
      admin_gmail,
      admin_password
    } = req.body;

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
      state: state || 'Telangana',
      email: email.toLowerCase(),
      phone: phone || '',
      website: website || '',
      university: university || 'Jawaharlal Nehru Technological University Hyderabad (JNTUH)',
      verification_status: 'VERIFIED', // Verified directly by Super Admin
      verified_at: new Date().toISOString(),
      verified_by: req.user.id,
      logo_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(college_code)}`
    });

    // Create Dedicated College Admin Account with separate Gmail & Password
    const cleanCode = college_code.toLowerCase().replace(/[^a-z0-9]/g, '');
    const collegeAdminName = (admin_name || `Prof. Dean (${college_code.toUpperCase()})`).trim();
    const collegeAdminEmail = (admin_email || admin_gmail || `${cleanCode}.admin@gmail.com`).trim().toLowerCase();
    const collegeAdminPassword = (admin_password || `${cleanCode}admin@123`).trim();

    const password_hash = await hashPassword(collegeAdminPassword);

    let adminUser = db.findOne('users', u => u.email.toLowerCase() === collegeAdminEmail);
    if (!adminUser) {
      adminUser = db.insert('users', {
        name: collegeAdminName,
        email: collegeAdminEmail,
        password_hash,
        role: 'COLLEGE_ADMIN',
        status: 'ACTIVE',
        college_id: newCollege.id,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(collegeAdminName)}`
      });
    } else {
      db.update('users', adminUser.id, {
        college_id: newCollege.id,
        role: 'COLLEGE_ADMIN',
        password_hash
      });
    }

    await logAudit({
      userId: req.user.id,
      action: 'COLLEGE_CREATED_WITH_ADMIN',
      entityType: 'COLLEGE',
      entityId: newCollege.id,
      details: { name, code: college_code, state: newCollege.state, adminEmail: collegeAdminEmail },
      ipAddress: req.ip
    });

    return res.status(201).json({ 
      success: true, 
      message: `College '${name}' created successfully in Telangana jurisdiction and administrator '${collegeAdminEmail}' activated.`, 
      college: newCollege,
      adminCredentials: {
        name: collegeAdminName,
        email: collegeAdminEmail,
        password: collegeAdminPassword,
        role: 'COLLEGE_ADMIN'
      }
    });
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

    // Main Admin is restricted to Telangana colleges only
    if (req.user?.role === 'SUPER_ADMIN' && !isTelanganaCollege(college)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Main Administrator authority is restricted to Telangana colleges only.'
      });
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

    if (req.user.role === 'SUPER_ADMIN' && !isTelanganaCollege(college)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Main Administrator can only edit Telangana colleges.' });
    }

    const { name, address, phone, website, university, logo_url, state } = req.body;
    const updates = {
      name: name || college.name,
      address: address !== undefined ? address : college.address,
      state: state !== undefined ? state : (college.state || 'Telangana'),
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
