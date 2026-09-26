export const DEMO_USERS = [
  {
    key: 'superadmin',
    name: 'Main Administrator (Super Admin)',
    email: 'superadmin@gmail.com',
    password: 'superadmin@123',
    role: 'SUPER_ADMIN',
    badge: 'Super Admin',
    desc: 'Platform-wide regulator, approve colleges, audit logs'
  },
  // College Administrators (Separate Gmail for each college)
  {
    key: 'apex_admin',
    name: 'Prof. Rajesh Sharma (Apex Admin)',
    collegeName: 'Apex Institute of Technology',
    email: 'apex.admin@gmail.com',
    password: 'apexadmin@123',
    role: 'COLLEGE_ADMIN',
    badge: 'Apex Tech Admin',
    desc: 'Manage Apex students, AI verification, physical issuance'
  },
  {
    key: 'global_admin',
    name: 'Dr. Michael Chang (Global Admin)',
    collegeName: 'Global University of Engineering & Science',
    email: 'global.admin@gmail.com',
    password: 'globaladmin@123',
    role: 'COLLEGE_ADMIN',
    badge: 'Global Univ Admin',
    desc: 'Manage Global Univ students & verification records'
  },
  {
    key: 'tkrec_admin',
    name: 'Prof. K. Venkatesh (TKREC Admin)',
    collegeName: 'Teegala Krishna Reddy Engineering College',
    email: 'tkrec.admin@gmail.com',
    password: 'tkrecadmin@123',
    role: 'COLLEGE_ADMIN',
    badge: 'TKREC Admin',
    desc: 'Manage TKREC students, original archives, vault locker tracking'
  },
  {
    key: 'cbit_admin',
    name: 'Dr. P. Ravinder Reddy (CBIT Admin)',
    collegeName: 'Chaitanya Bharathi Institute of Technology',
    email: 'cbit.admin@gmail.com',
    password: 'cbitadmin@123',
    role: 'COLLEGE_ADMIN',
    badge: 'CBIT Admin',
    desc: 'Manage CBIT students & autonomous verification records'
  },
  {
    key: 'vnr_admin',
    name: 'Prof. C. Kiran (VNR Admin)',
    collegeName: 'VNR Vignana Jyothi Institute of Engineering & Technology',
    email: 'vnr.admin@gmail.com',
    password: 'vnradmin@123',
    role: 'COLLEGE_ADMIN',
    badge: 'VNR Admin',
    desc: 'Manage VNR students and academic verification records'
  },
  {
    key: 'ou_admin',
    name: 'Dr. S. Ramachandram (OU Admin)',
    collegeName: 'University College of Engineering, Osmania University',
    email: 'ou.admin@gmail.com',
    password: 'ouadmin@123',
    role: 'COLLEGE_ADMIN',
    badge: 'OU Admin',
    desc: 'Manage OU engineering students and degree archives'
  },
  {
    key: 'vasavi_admin',
    name: 'Prof. T. V. Rao (Vasavi Admin)',
    collegeName: 'Vasavi College of Engineering',
    email: 'vasavi.admin@gmail.com',
    password: 'vasaviadmin@123',
    role: 'COLLEGE_ADMIN',
    badge: 'Vasavi Admin',
    desc: 'Manage Vasavi College student certificates & verification'
  },
  {
    key: 'sunrise_admin',
    name: 'Dr. S. N. Rao (Sunrise Admin)',
    collegeName: 'Sunrise Academy of Science & Applied Tech',
    email: 'sunrise.admin@gmail.com',
    password: 'sunriseadmin@123',
    role: 'COLLEGE_ADMIN',
    badge: 'Sunrise Admin',
    desc: 'Manage Sunrise Academy student documents'
  },

  // Students - Apex Institute
  {
    key: 'student_aarav',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@student.edu',
    password: 'StudentPass@123',
    role: 'STUDENT',
    collegeName: 'Apex Institute of Technology',
    collegeCode: 'APEX-TECH',
    course: 'B.Tech Computer Science (2022-2026)',
    rollNumber: 'APEX/CS/22/0101',
    badge: 'Apex CSE Student',
    desc: '4 certificates, 1 physical issued, 1 approved request'
  },
  {
    key: 'student_priya',
    name: 'Priya Patel',
    email: 'priya.patel@student.edu',
    password: 'StudentPass@123',
    role: 'STUDENT',
    collegeName: 'Apex Institute of Technology',
    collegeCode: 'APEX-TECH',
    course: 'B.Tech Information Technology (2023-2027)',
    rollNumber: 'APEX/IT/23/0204',
    badge: 'Apex IT Student',
    desc: '2 certificates, 1 pending request'
  },

  // Students - Global University
  {
    key: 'student_rohan',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@student.edu',
    password: 'StudentPass@123',
    role: 'STUDENT',
    collegeName: 'Global University of Engineering & Science',
    collegeCode: 'GUES-UNIV',
    course: 'M.Tech Artificial Intelligence (2023-2025)',
    rollNumber: 'GUES/AI/23/0012',
    badge: 'Global AI Student',
    desc: 'M.Tech student with verified degree transcripts'
  },
  {
    key: 'student_ananya',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@student.edu',
    password: 'StudentPass@123',
    role: 'STUDENT',
    collegeName: 'Global University of Engineering & Science',
    collegeCode: 'GUES-UNIV',
    course: 'B.Tech Data Science (2022-2026)',
    rollNumber: 'GUES/DS/22/0088',
    badge: 'Global DS Student',
    desc: 'B.Tech Data Science student records'
  },

  // Students - Teegala Krishna Reddy Engineering College (TKREC)
  {
    key: 'student_kavya',
    name: 'Kavya Reddy',
    email: 'kavya.reddy@student.edu',
    password: 'StudentPass@123',
    role: 'STUDENT',
    collegeName: 'Teegala Krishna Reddy Engineering College',
    collegeCode: 'TKREC-HYD',
    course: 'B.Tech Computer Science & Engg (2022-2026)',
    rollNumber: 'TKREC/CSE/22/0315',
    badge: 'TKREC CSE Student',
    desc: 'Original Degree & 10th Certificate stored in Vault Rack 2'
  },
  {
    key: 'student_saiteja',
    name: 'Sai Teja',
    email: 'sai.teja@student.edu',
    password: 'StudentPass@123',
    role: 'STUDENT',
    collegeName: 'Teegala Krishna Reddy Engineering College',
    collegeCode: 'TKREC-HYD',
    course: 'B.Tech Electronics & Comm (2022-2026)',
    rollNumber: 'TKREC/ECE/22/0142',
    badge: 'TKREC ECE Student',
    desc: 'Original B.Tech Degree Certificate in Vault Box 14'
  },

  // Students - Chaitanya Bharathi Institute of Technology (CBIT)
  {
    key: 'student_aditya',
    name: 'Aditya Varma',
    email: 'aditya.varma@student.edu',
    password: 'StudentPass@123',
    role: 'STUDENT',
    collegeName: 'Chaitanya Bharathi Institute of Technology',
    collegeCode: 'CBIT-HYD',
    course: 'B.Tech AI & Data Science (2023-2027)',
    rollNumber: 'CBIT/AIDS/23/0078',
    badge: 'CBIT AIDS Student',
    desc: 'Original Degree Certificate in Admin Archive Locker 108'
  },

  // Students - Sunrise Academy
  {
    key: 'student_vikram',
    name: 'Vikram Sen',
    email: 'vikram.sen@student.edu',
    password: 'StudentPass@123',
    role: 'STUDENT',
    collegeName: 'Sunrise Academy of Science & Applied Tech',
    collegeCode: 'SUNRISE-SCI',
    course: 'B.Sc Applied Physics (2022-2025)',
    rollNumber: 'SUN/PHY/22/0045',
    badge: 'Sunrise Sci Student',
    desc: '1 AI Suspicious Mismatch sample certificate'
  }
];
