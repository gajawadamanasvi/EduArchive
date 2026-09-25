import db from '../config/db.js';
import { logAudit } from '../services/auditService.js';
import { hashPassword } from '../utils/security.js';
import { isTelanganaCollege, getTelanganaCollegeIds } from '../utils/jurisdiction.js';

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

    if (req.user.role === 'SUPER_ADMIN') {
      const studentCollege = db.findById('colleges', student.college_id);
      if (studentCollege && !isTelanganaCollege(studentCollege)) {
        return res.status(403).json({ success: false, message: 'Access Denied: Main Administrator authority is restricted to Telangana colleges only.' });
      }
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

    const { 
      phone, 
      profile_photo, 
      name, 
      email, 
      gmail, 
      password, 
      course, 
      department, 
      academic_year, 
      roll_number, 
      student_id_number,
      registration_no 
    } = req.body;

    // Student role restriction: Only safe fields can be updated
    if (req.user.role === 'STUDENT') {
      if (String(student.id) !== String(req.student?.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You cannot modify another student profile.' });
      }

      const safeUpdates = {};
      if (phone !== undefined) safeUpdates.phone = String(phone).trim();
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

    if (req.user.role === 'SUPER_ADMIN') {
      const studentCollege = db.findById('colleges', student.college_id);
      if (studentCollege && !isTelanganaCollege(studentCollege)) {
        return res.status(403).json({ success: false, message: 'Access Denied: Main Administrator authority is restricted to Telangana colleges only.' });
      }
    }

    const finalRegNo = student_id_number !== undefined ? student_id_number : (registration_no !== undefined ? registration_no : student.student_id_number);
    const adminUpdates = {
      phone: phone !== undefined ? String(phone).trim() : student.phone,
      course: course !== undefined ? String(course).trim() : student.course,
      department: department !== undefined ? String(department).trim() : student.department,
      academic_year: academic_year !== undefined ? String(academic_year).trim() : student.academic_year,
      roll_number: roll_number !== undefined ? String(roll_number).trim() : student.roll_number,
      student_id_number: finalRegNo ? String(finalRegNo).trim() : student.student_id_number
    };

    db.update('students', student.id, adminUpdates);

    // Update user record (name, email, password)
    const userUpdates = {};
    if (name) userUpdates.name = String(name).trim();
    
    const newEmail = email || gmail;
    if (newEmail) {
      const normalizedEmail = String(newEmail).trim().toLowerCase();
      const duplicate = db.findOne('users', u => u.email.toLowerCase() === normalizedEmail && String(u.id) !== String(student.user_id));
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Another account already uses this email/gmail.' });
      }
      userUpdates.email = normalizedEmail;
    }

    if (password && String(password).trim().length > 0) {
      userUpdates.password_hash = await hashPassword(String(password).trim());
    }

    if (Object.keys(userUpdates).length > 0) {
      db.update('users', student.user_id, userUpdates);
    }

    await logAudit({
      userId: req.user.id,
      action: 'ADMIN_STUDENT_UPDATED',
      entityType: 'STUDENT',
      entityId: student.id,
      details: { ...adminUpdates, updated_credentials: Boolean(password || newEmail) },
      ipAddress: req.ip
    });

    const updated = db.getStudentWithDetails(student.id);
    return res.json({ success: true, message: 'Student profile & credentials updated by administrator.', student: updated });
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
      const telanganaCollegeIds = getTelanganaCollegeIds();
      students = db.find('students', s => telanganaCollegeIds.has(String(s.college_id)));
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
    const { 
      name, 
      email, 
      gmail, 
      password, 
      roll_number, 
      student_id_number, 
      registration_no, 
      course, 
      department, 
      academic_year, 
      phone 
    } = req.body;

    const studentName = (name || '').trim();
    const studentEmail = (email || gmail || '').trim().toLowerCase();
    const studentRollNo = (roll_number || '').trim();
    const studentRegNo = (student_id_number || registration_no || '').trim() || `REG-${Date.now().toString().slice(-6)}`;
    const studentPassword = (password || '').trim() || 'StudentPass@123';
    const studentPhone = (phone || '').trim();
    const studentCourse = (course || 'Bachelor of Technology in Computer Science').trim();
    const studentDept = (department || 'Computer Science & Engineering').trim();
    const studentYear = (academic_year || '2022-2026').trim();

    if (!studentName || !studentEmail || !studentRollNo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student Name, Gmail/Email, and Student Roll Number are required.' 
      });
    }

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === studentEmail);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: `An account with email/gmail '${studentEmail}' already exists. Please use a unique email or edit the existing student.` 
      });
    }

    const collegeId = req.user.role === 'COLLEGE_ADMIN' ? req.user.college_id : req.body.college_id;
    if (!collegeId) {
      return res.status(400).json({ success: false, message: 'College assignment is required.' });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      const targetCollege = db.findById('colleges', collegeId);
      if (targetCollege && !isTelanganaCollege(targetCollege)) {
        return res.status(403).json({ success: false, message: 'Access Denied: Main Administrator can only register students in Telangana colleges.' });
      }
    }

    const password_hash = await hashPassword(studentPassword);
    const newUser = db.insert('users', {
      name: studentName,
      email: studentEmail,
      password_hash,
      role: 'STUDENT',
      status: 'ACTIVE',
      college_id: collegeId,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}`
    });

    const newStudent = db.insert('students', {
      user_id: newUser.id,
      college_id: collegeId,
      student_id_number: studentRegNo,
      roll_number: studentRollNo,
      course: studentCourse,
      department: studentDept,
      academic_year: studentYear,
      phone: studentPhone
    });

    await logAudit({
      userId: req.user.id,
      action: 'STUDENT_CREATED',
      entityType: 'STUDENT',
      entityId: newStudent.id,
      details: { 
        name: studentName, 
        email: studentEmail, 
        roll_number: studentRollNo, 
        student_id_number: studentRegNo,
        collegeId 
      },
      ipAddress: req.ip
    });

    const fullStudent = db.getStudentWithDetails(newStudent.id);
    return res.status(201).json({ 
      success: true, 
      message: `Student '${studentName}' enrolled successfully with credentials established.`, 
      student: fullStudent,
      credentials: {
        email: studentEmail,
        roll_number: studentRollNo,
        registration_no: studentRegNo,
        password: studentPassword
      }
    });
  } catch (error) {
    console.error('[CreateStudent Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create student record: ' + error.message });
  }
};
