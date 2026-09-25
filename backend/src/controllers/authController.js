import db from '../config/db.js';
import { hashPassword, comparePassword, generateToken } from '../utils/security.js';
import { logAudit } from '../services/auditService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'STUDENT', college_id, roll_number, student_id_number, course, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const password_hash = await hashPassword(password);
    const validRole = ['STUDENT', 'COLLEGE_ADMIN', 'SUPER_ADMIN'].includes(role) ? role : 'STUDENT';

    const newUser = db.insert('users', {
      name,
      email: email.toLowerCase(),
      password_hash,
      role: validRole,
      status: 'ACTIVE',
      college_id: college_id || null,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });

    // If student, create student profile
    let studentProfile = null;
    if (validRole === 'STUDENT') {
      studentProfile = db.insert('students', {
        user_id: newUser.id,
        college_id: college_id || null,
        student_id_number: student_id_number || `STU-${Date.now().toString().slice(-6)}`,
        roll_number: roll_number || `R-${Math.floor(10000 + Math.random() * 90000)}`,
        course: course || 'General Studies',
        department: department || 'Engineering',
        academic_year: '2022-2026',
        phone: phone || ''
      });
    }

    await logAudit({
      userId: newUser.id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: newUser.id,
      details: { role: validRole, email: newUser.email },
      ipAddress: req.ip
    });

    const token = generateToken({ id: newUser.id, role: newUser.role, email: newUser.email });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar_url: newUser.avatar_url,
        student_id: studentProfile ? studentProfile.id : null,
        college_id: newUser.college_id || (studentProfile ? studentProfile.college_id : null)
      }
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, gmail, username } = req.body;
    const identifier = String(email || gmail || username || '').trim().toLowerCase();
    const rawPassword = String(password || '').trim();

    if (!identifier || !rawPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both email/Roll No and password.' });
    }

    // 1. Match by Email / Gmail
    let user = db.findOne('users', u => u.email && u.email.trim().toLowerCase() === identifier);

    // 2. If not found by email, check if identifier is a student's Roll Number or Registration Number
    if (!user) {
      const studentMatch = db.findOne('students', s => 
        (s.roll_number && s.roll_number.trim().toLowerCase() === identifier) ||
        (s.student_id_number && s.student_id_number.trim().toLowerCase() === identifier)
      );
      if (studentMatch) {
        user = db.findById('users', studentMatch.user_id);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials: No account found with this email or Roll Number.' });
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is inactive or suspended. Please contact your college administrator.' });
    }

    const isMatch = await comparePassword(rawPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials: Password does not match.' });
    }

    let studentProfile = null;
    let college = null;

    if (user.role === 'STUDENT') {
      studentProfile = db.findOne('students', s => String(s.user_id) === String(user.id));
      if (studentProfile?.college_id) {
        college = db.findById('colleges', studentProfile.college_id);
      }
    } else if (user.role === 'COLLEGE_ADMIN' && user.college_id) {
      college = db.findById('colleges', user.college_id);
    }

    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      details: { role: user.role, email: user.email },
      ipAddress: req.ip
    });

    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      student_id: studentProfile ? studentProfile.id : null,
      college_id: user.college_id || (studentProfile ? studentProfile.college_id : null)
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        student_id: studentProfile ? studentProfile.id : null,
        college_id: user.college_id || (studentProfile ? studentProfile.college_id : null),
        college_name: college ? college.name : null,
        college_verified: college ? college.verification_status === 'VERIFIED' : false
      }
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = db.findById('users', req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let student = null;
    let college = null;

    if (user.role === 'STUDENT') {
      student = db.getStudentWithDetails(req.user.student_id || (db.findOne('students', s => String(s.user_id) === String(user.id))?.id));
      if (student?.college_id) {
        college = db.findById('colleges', student.college_id);
      }
    } else if (user.college_id) {
      college = db.findById('colleges', user.college_id);
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar_url: user.avatar_url,
        student,
        college
      }
    });
  } catch (error) {
    console.error('[GetMe Error]:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
};
