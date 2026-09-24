import db from '../config/db.js';
import { logAudit } from '../services/auditService.js';
import { hashPassword } from '../utils/security.js';

export const getStudentProfile = async (req, res) => {
  try {
    let studentId = req.params.id;

    if (req.user.role === 'STUDENT') {
      studentId = req.student?.id;
    }

    if (!studentId) {
      return res.status(404).json({ success: false, message: 'Student profile not linked.' });
    }

    const student = db.getStudentWithDetails(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    return res.json({ success: true, student });
  } catch (error) {
    console.error('[GetStudentProfile Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve student profile.' });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = db.findById('students', studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const { phone, profile_photo, name, course, department, academic_year, roll_number, student_id_number } = req.body;

    // Student role restriction: Only safe fields can be updated
    if (req.user.role === 'STUDENT') {
      if (String(student.id) !== String(req.student?.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You cannot modify another student profile.' });
      }

      const safeUpdates = {};
      if (phone !== undefined) safeUpdates.phone = phone;
      if (profile_photo !== undefined) safeUpdates.profile_photo = profile_photo;

      db.update('students', student.id, safeUpdates);

      await logAudit({
        userId: req.user.id,
        action: 'STUDENT_PROFILE_UPDATED',
        entityType: 'STUDENT',
        entityId: student.id,
        details: { updated_fields: Object.keys(safeUpdates) },
        ipAddress: req.ip
      });

      const updated = db.getStudentWithDetails(student.id);
      return res.json({ success: true, message: 'Profile updated successfully.', student: updated });
    }

    // College Admin and Super Admin updates
    if (req.user.role === 'COLLEGE_ADMIN' && String(student.college_id) !== String(req.user.college_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot edit student of another college.' });
    }

    const adminUpdates = {
      phone: phone !== undefined ? phone : student.phone,
      course: course !== undefined ? course : student.course,
      department: department !== undefined ? department : student.department,
      academic_year: academic_year !== undefined ? academic_year : student.academic_year,
      roll_number: roll_number !== undefined ? roll_number : student.roll_number,
      student_id_number: student_id_number !== undefined ? student_id_number : student.student_id_number
    };

    db.update('students', student.id, adminUpdates);

    if (name) {
      db.update('users', student.user_id, { name });
    }

    await logAudit({
      userId: req.user.id,
      action: 'ADMIN_STUDENT_UPDATED',
      entityType: 'STUDENT',
      entityId: student.id,
      details: adminUpdates,
      ipAddress: req.ip
    });

    const updated = db.getStudentWithDetails(student.id);
    return res.json({ success: true, message: 'Student profile updated by administrator.', student: updated });
  } catch (error) {
    console.error('[UpdateStudentProfile Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update student profile.' });
  }
};

export const getCollegeStudents = async (req, res) => {
  try {
    let collegeId = req.query.college_id;

    if (req.user.role === 'COLLEGE_ADMIN') {
      collegeId = req.user.college_id;
    }

    let students = [];
    if (collegeId) {
      students = db.find('students', s => String(s.college_id) === String(collegeId));
    } else if (req.user.role === 'SUPER_ADMIN') {
      students = db.find('students');
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized college scope.' });
    }

    const enriched = students.map(s => db.getStudentWithDetails(s.id));
    return res.json({ success: true, count: enriched.length, students: enriched });
  } catch (error) {
    console.error('[GetCollegeStudents Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { name, email, password = 'StudentPass@123', roll_number, student_id_number, course, department, academic_year, phone } = req.body;

    if (!name || !email || !roll_number) {
      return res.status(400).json({ success: false, message: 'Name, email, and roll number are mandatory.' });
    }

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
    }

    const collegeId = req.user.role === 'COLLEGE_ADMIN' ? req.user.college_id : req.body.college_id;
    if (!collegeId) {
      return res.status(400).json({ success: false, message: 'College assignment is required.' });
    }

    const password_hash = await hashPassword(password);
    const newUser = db.insert('users', {
      name,
      email: email.toLowerCase(),
      password_hash,
      role: 'STUDENT',
      status: 'ACTIVE',
      college_id: collegeId,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });

    const newStudent = db.insert('students', {
      user_id: newUser.id,
      college_id: collegeId,
      student_id_number: student_id_number || `STU-${Date.now().toString().slice(-6)}`,
      roll_number,
      course: course || 'Bachelor of Technology',
      department: department || 'Computer Science',
      academic_year: academic_year || '2022-2026',
      phone: phone || ''
    });

    await logAudit({
      userId: req.user.id,
      action: 'STUDENT_CREATED',
      entityType: 'STUDENT',
      entityId: newStudent.id,
      details: { name, email, roll_number, collegeId },
      ipAddress: req.ip
    });

    const fullStudent = db.getStudentWithDetails(newStudent.id);
    return res.status(201).json({ success: true, message: 'Student registered successfully.', student: fullStudent });
  } catch (error) {
    console.error('[CreateStudent Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create student record.' });
  }
};
