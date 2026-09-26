import db from '../src/config/db.js';
import { createStudent } from '../src/controllers/studentController.js';

async function testCollegeAdminAddStudent() {
  console.log('Testing College Admin Student Enrollment Permission...');

  // 1. Get a College Admin user from DB
  const collegeAdmin = db.findOne('users', u => u.role === 'COLLEGE_ADMIN');
  console.log(`Using College Admin: ${collegeAdmin.name} (College ID: ${collegeAdmin.college_id})`);

  const mockReq = {
    user: {
      id: collegeAdmin.id,
      name: collegeAdmin.name,
      role: 'COLLEGE_ADMIN',
      college_id: collegeAdmin.college_id
    },
    body: {
      name: 'Priya Patel',
      email: `priya_${Date.now()}@apex.edu`,
      roll_number: `APEX/CS/24/${Math.floor(100 + Math.random() * 900)}`,
      student_id_number: `STU-APEX-${Date.now().toString().slice(-4)}`,
      course: 'Bachelor of Technology in Computer Science',
      department: 'Computer Science & Engineering',
      academic_year: '2024-2028',
      phone: '+91 98765 43210',
      password: 'StudentPass@123'
    },
    ip: '127.0.0.1'
  };

  let responseData = null;
  let responseStatus = 200;

  const mockRes = {
    status: (code) => {
      responseStatus = code;
      return mockRes;
    },
    json: (data) => {
      responseData = data;
      return mockRes;
    }
  };

  await createStudent(mockReq, mockRes);

  console.log('Response Status:', responseStatus);
  console.log('Response Data:', responseData);

  if (responseData?.success && responseData?.student) {
    console.log('✓ SUCCESS: College Admin successfully enrolled student!');
    console.log('  Student ID:', responseData.student.id);
    console.log('  Student Name:', responseData.student.user?.name);
    console.log('  Roll Number:', responseData.student.roll_number);
    console.log('  College ID:', responseData.student.college_id);
    console.log('  Login Email:', responseData.credentials.email);
  } else {
    console.error('✗ FAILED:', responseData);
  }
}

testCollegeAdminAddStudent().catch(console.error);
