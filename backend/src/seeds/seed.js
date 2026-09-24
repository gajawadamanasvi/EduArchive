import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const seedDatabase = async () => {
  console.log('[SEED] Starting full relational database seed...');

  const superAdminHash = await bcrypt.hash('AdminPass@123', 10);
  const collegePassHash = await bcrypt.hash('CollegePass@123', 10);
  const studentPassHash = await bcrypt.hash('StudentPass@123', 10);

  // 1. Colleges
  const colleges = [
    {
      id: 'col_apex',
      name: 'Apex Institute of Technology',
      college_code: 'APEX-TECH',
      address: 'Knowledge City, Tech Park Road, Sector 62',
      email: 'contact@apex.edu',
      phone: '+91 98765 43210',
      website: 'https://apex-tech.edu',
      university: 'State Technological University',
      verification_status: 'VERIFIED',
      verified_at: '2026-01-15T10:00:00.000Z',
      verified_by: 'usr_superadmin',
      logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=APEX',
      created_at: '2026-01-10T08:00:00.000Z'
    },
    {
      id: 'col_global',
      name: 'Global University of Engineering & Science',
      college_code: 'GUES-UNIV',
      address: 'University Boulevard, Innovation District',
      email: 'registrar@globaluniv.edu',
      phone: '+91 98765 12345',
      website: 'https://globaluniv.edu',
      university: 'National Science & Research University',
      verification_status: 'VERIFIED',
      verified_at: '2026-02-20T11:30:00.000Z',
      verified_by: 'usr_superadmin',
      logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=GLOBAL',
      created_at: '2026-02-01T09:00:00.000Z'
    },
    {
      id: 'col_tkrec',
      name: 'Teegala Krishna Reddy Engineering College',
      college_code: 'TKREC-HYD',
      address: 'Medbowli, Meerpet, Saroornagar, Hyderabad, Telangana 500097',
      email: 'admin@tkrec.ac.in',
      phone: '+91 40 2409 2555',
      website: 'https://tkrec.ac.in',
      university: 'Jawaharlal Nehru Technological University Hyderabad (JNTUH)',
      verification_status: 'VERIFIED',
      verified_at: '2026-03-01T10:00:00.000Z',
      verified_by: 'usr_superadmin',
      logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=TKREC',
      created_at: '2026-02-15T08:00:00.000Z'
    },
    {
      id: 'col_cbit',
      name: 'Chaitanya Bharathi Institute of Technology',
      college_code: 'CBIT-HYD',
      address: 'Gandipet, Hyderabad, Telangana 500075',
      email: 'admin@cbit.ac.in',
      phone: '+91 40 2419 3276',
      website: 'https://cbit.ac.in',
      university: 'Osmania University (Autonomous)',
      verification_status: 'VERIFIED',
      verified_at: '2026-03-10T11:00:00.000Z',
      verified_by: 'usr_superadmin',
      logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=CBIT',
      created_at: '2026-02-20T08:00:00.000Z'
    },
    {
      id: 'col_sunrise',
      name: 'Sunrise Academy of Science & Applied Tech',
      college_code: 'SUNRISE-SCI',
      address: 'Green Hills Campus, Highway 44',
      email: 'admin@sunrise.edu',
      phone: '+91 98765 99887',
      website: 'https://sunrise.edu',
      university: 'Metropolitan Central University',
      verification_status: 'PENDING',
      verified_at: null,
      verified_by: null,
      logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=SUNRISE',
      created_at: '2026-08-10T14:20:00.000Z'
    }
  ];

  // 2. Users (Super Admin, College Admins, Students)
  const users = [
    {
      id: 'usr_superadmin',
      name: 'Dr. Evelyn Vance (Super Admin)',
      email: 'superadmin@system.edu',
      password_hash: superAdminHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      college_id: null,
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=SuperAdmin',
      created_at: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr_admin_apex',
      name: 'Prof. Rajesh Sharma (Dean)',
      email: 'admin@apex.edu',
      password_hash: collegePassHash,
      role: 'COLLEGE_ADMIN',
      status: 'ACTIVE',
      college_id: 'col_apex',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=ApexAdmin',
      created_at: '2026-01-10T08:30:00.000Z'
    },
    {
      id: 'usr_admin_global',
      name: 'Dr. Michael Chang (Registrar)',
      email: 'admin@globaluniv.edu',
      password_hash: collegePassHash,
      role: 'COLLEGE_ADMIN',
      status: 'ACTIVE',
      college_id: 'col_global',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=GlobalAdmin',
      created_at: '2026-02-01T09:30:00.000Z'
    },
    {
      id: 'usr_admin_tkrec',
      name: 'Prof. K. Venkatesh (Principal)',
      email: 'admin@tkrec.ac.in',
      password_hash: collegePassHash,
      role: 'COLLEGE_ADMIN',
      status: 'ACTIVE',
      college_id: 'col_tkrec',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=TKRECAdmin',
      created_at: '2026-02-15T09:00:00.000Z'
    },
    {
      id: 'usr_admin_cbit',
      name: 'Dr. P. Ravinder Reddy (Dean)',
      email: 'admin@cbit.ac.in',
      password_hash: collegePassHash,
      role: 'COLLEGE_ADMIN',
      status: 'ACTIVE',
      college_id: 'col_cbit',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=CBITAdmin',
      created_at: '2026-02-20T09:00:00.000Z'
    },
    {
      id: 'usr_admin_sunrise',
      name: 'Dr. S. N. Rao (Director)',
      email: 'admin@sunrise.edu',
      password_hash: collegePassHash,
      role: 'COLLEGE_ADMIN',
      status: 'ACTIVE',
      college_id: 'col_sunrise',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=SunriseAdmin',
      created_at: '2026-08-10T09:00:00.000Z'
    },
    // Students - Apex
    {
      id: 'usr_student_1',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@student.edu',
      password_hash: studentPassHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      college_id: 'col_apex',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=AaravSharma',
      created_at: '2026-03-01T10:00:00.000Z'
    },
    {
      id: 'usr_student_2',
      name: 'Priya Patel',
      email: 'priya.patel@student.edu',
      password_hash: studentPassHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      college_id: 'col_apex',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=PriyaPatel',
      created_at: '2026-03-05T11:00:00.000Z'
    },
    // Students - Global
    {
      id: 'usr_student_3',
      name: 'Rohan Mehta',
      email: 'rohan.mehta@student.edu',
      password_hash: studentPassHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      college_id: 'col_global',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=RohanMehta',
      created_at: '2026-03-10T12:00:00.000Z'
    },
    {
      id: 'usr_student_4',
      name: 'Ananya Iyer',
      email: 'ananya.iyer@student.edu',
      password_hash: studentPassHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      college_id: 'col_global',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=AnanyaIyer',
      created_at: '2026-03-15T13:00:00.000Z'
    },
    // Students - TKREC (Teegala Krishna Reddy Engg College)
    {
      id: 'usr_student_6',
      name: 'Kavya Reddy',
      email: 'kavya.reddy@student.edu',
      password_hash: studentPassHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      college_id: 'col_tkrec',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=KavyaReddy',
      created_at: '2026-03-18T10:00:00.000Z'
    },
    {
      id: 'usr_student_7',
      name: 'Sai Teja',
      email: 'sai.teja@student.edu',
      password_hash: studentPassHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      college_id: 'col_tkrec',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=SaiTeja',
      created_at: '2026-03-19T11:00:00.000Z'
    },
    // Students - CBIT
    {
      id: 'usr_student_8',
      name: 'Aditya Varma',
      email: 'aditya.varma@student.edu',
      password_hash: studentPassHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      college_id: 'col_cbit',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=AdityaVarma',
      created_at: '2026-03-20T10:00:00.000Z'
    },
    // Students - Sunrise
    {
      id: 'usr_student_5',
      name: 'Vikram Sen',
      email: 'vikram.sen@student.edu',
      password_hash: studentPassHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      college_id: 'col_sunrise',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=VikramSen',
      created_at: '2026-08-15T15:00:00.000Z'
    }
  ];

  // 3. Student Profiles
  const students = [
    {
      id: 'stu_1',
      user_id: 'usr_student_1',
      college_id: 'col_apex',
      student_id_number: 'APEX-2022-CSE-042',
      roll_number: 'APEX/CS/22/0101',
      course: 'Bachelor of Technology in Computer Science',
      department: 'Computer Science & Engineering',
      academic_year: '2022-2026',
      phone: '+91 98111 22334',
      profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=AaravSharma',
      created_at: '2026-03-01T10:00:00.000Z'
    },
    {
      id: 'stu_2',
      user_id: 'usr_student_2',
      college_id: 'col_apex',
      student_id_number: 'APEX-2022-IT-089',
      roll_number: 'APEX/IT/22/0102',
      course: 'Bachelor of Technology in Information Technology',
      department: 'Information Technology',
      academic_year: '2022-2026',
      phone: '+91 98222 33445',
      profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=PriyaPatel',
      created_at: '2026-03-05T11:00:00.000Z'
    },
    {
      id: 'stu_3',
      user_id: 'usr_student_3',
      college_id: 'col_global',
      student_id_number: 'GUES-2022-ME-115',
      roll_number: 'GUES/ME/22/0201',
      course: 'Bachelor of Science in Mechanical Engineering',
      department: 'Mechanical Engineering',
      academic_year: '2022-2026',
      phone: '+91 98333 44556',
      profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=RohanMehta',
      created_at: '2026-03-10T12:00:00.000Z'
    },
    {
      id: 'stu_4',
      user_id: 'usr_student_4',
      college_id: 'col_global',
      student_id_number: 'GUES-2022-EC-054',
      roll_number: 'GUES/EC/22/0202',
      course: 'Bachelor of Science in Electronics & Comm',
      department: 'Electronics & Communication',
      academic_year: '2022-2026',
      phone: '+91 98444 55667',
      profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=AnanyaIyer',
      created_at: '2026-03-15T13:00:00.000Z'
    },
    {
      id: 'stu_6',
      user_id: 'usr_student_6',
      college_id: 'col_tkrec',
      student_id_number: 'TKREC-2022-CSE-0315',
      roll_number: 'TKREC/CSE/22/0315',
      course: 'Bachelor of Technology in Computer Science & Engineering',
      department: 'Computer Science & Engineering',
      academic_year: '2022-2026',
      phone: '+91 98666 77889',
      profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=KavyaReddy',
      created_at: '2026-03-18T10:00:00.000Z'
    },
    {
      id: 'stu_7',
      user_id: 'usr_student_7',
      college_id: 'col_tkrec',
      student_id_number: 'TKREC-2022-ECE-0142',
      roll_number: 'TKREC/ECE/22/0142',
      course: 'Bachelor of Technology in Electronics & Communication',
      department: 'Electronics & Communication',
      academic_year: '2022-2026',
      phone: '+91 98777 88990',
      profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=SaiTeja',
      created_at: '2026-03-19T11:00:00.000Z'
    },
    {
      id: 'stu_8',
      user_id: 'usr_student_8',
      college_id: 'col_cbit',
      student_id_number: 'CBIT-2023-AIDS-0078',
      roll_number: 'CBIT/AIDS/23/0078',
      course: 'Bachelor of Technology in Artificial Intelligence & Data Science',
      department: 'AI & Data Science',
      academic_year: '2023-2027',
      phone: '+91 98888 99001',
      profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=AdityaVarma',
      created_at: '2026-03-20T10:00:00.000Z'
    },
    {
      id: 'stu_5',
      user_id: 'usr_student_5',
      college_id: 'col_sunrise',
      student_id_number: 'SUN-2023-DS-019',
      roll_number: 'SUN/DS/23/0301',
      course: 'Bachelor of Science in Applied Data Science',
      department: 'Data Science & Analytics',
      academic_year: '2023-2027',
      phone: '+91 98555 66778',
      profile_photo: 'https://api.dicebear.com/7.x/initials/svg?seed=VikramSen',
      created_at: '2026-08-15T15:00:00.000Z'
    }
  ];

  // 4. Documents (12+ Demo Certificates)
  const documents = [
    // Aarav Sharma (Apex)
    {
      id: 'doc_101',
      student_id: 'stu_1',
      college_id: 'col_apex',
      document_type: 'Degree Certificate',
      title: 'B.Tech Computer Science Degree Certificate',
      file_path: '',
      file_name: 'Degree_Certificate_Aarav_Sharma.pdf',
      file_size: 420000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_apex',
      upload_date: '2026-04-10T09:00:00.000Z'
    },
    {
      id: 'doc_102',
      student_id: 'stu_1',
      college_id: 'col_apex',
      document_type: '10th Certificate',
      title: 'Secondary School Examination Certificate (Class X)',
      file_path: '',
      file_name: '10th_Certificate_Aarav_Sharma.pdf',
      file_size: 310000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_apex',
      upload_date: '2026-04-10T09:15:00.000Z'
    },
    {
      id: 'doc_103',
      student_id: 'stu_1',
      college_id: 'col_apex',
      document_type: '12th Certificate',
      title: 'Higher Secondary Certificate (Class XII)',
      file_path: '',
      file_name: '12th_Certificate_Aarav_Sharma.pdf',
      file_size: 325000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_apex',
      upload_date: '2026-04-10T09:30:00.000Z'
    },
    {
      id: 'doc_104',
      student_id: 'stu_1',
      college_id: 'col_apex',
      document_type: 'Marksheet',
      title: 'Consolidated Academic Transcript (Semesters I - VIII)',
      file_path: '',
      file_name: 'Consolidated_Marksheet_Aarav.pdf',
      file_size: 580000,
      mime_type: 'application/pdf',
      status: 'PHYSICAL_ISSUED',
      physical_issue_details: {
        issued_to: 'Aarav Sharma',
        issued_date: '2026-09-18',
        issued_by_admin_id: 'usr_admin_apex',
        issued_by_admin_name: 'Prof. Rajesh Sharma (Dean)',
        remark: 'Physical certificate temporarily issued to student for German Embassy visa interview.',
        return_expected_date: '2026-10-05',
        is_returned: false
      },
      uploaded_by: 'usr_admin_apex',
      upload_date: '2026-05-12T10:00:00.000Z'
    },

    // Priya Patel (Apex)
    {
      id: 'doc_201',
      student_id: 'stu_2',
      college_id: 'col_apex',
      document_type: 'Degree Certificate',
      title: 'B.Tech Information Technology Degree Certificate',
      file_path: '',
      file_name: 'Degree_Certificate_Priya_Patel.pdf',
      file_size: 410000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_apex',
      upload_date: '2026-04-15T11:00:00.000Z'
    },
    {
      id: 'doc_202',
      student_id: 'stu_2',
      college_id: 'col_apex',
      document_type: 'Transfer Certificate',
      title: 'Institutional Transfer & Conduct Certificate',
      file_path: '',
      file_name: 'Transfer_Certificate_Priya.pdf',
      file_size: 190000,
      mime_type: 'application/pdf',
      status: 'PENDING',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_apex',
      upload_date: '2026-09-19T14:00:00.000Z'
    },

    // Rohan Mehta (Global Univ)
    {
      id: 'doc_301',
      student_id: 'stu_3',
      college_id: 'col_global',
      document_type: 'Degree Certificate',
      title: 'B.Sc Mechanical Engineering Degree',
      file_path: '',
      file_name: 'Degree_Mechanical_Rohan_Mehta.pdf',
      file_size: 430000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_global',
      upload_date: '2026-04-20T10:30:00.000Z'
    },
    {
      id: 'doc_302',
      student_id: 'stu_3',
      college_id: 'col_global',
      document_type: 'Marksheet',
      title: 'Mechanical Final Year Official Grade Sheet',
      file_path: '',
      file_name: 'GradeSheet_Final_Rohan.pdf',
      file_size: 380000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_global',
      upload_date: '2026-04-20T11:00:00.000Z'
    },
    {
      id: 'doc_303',
      student_id: 'stu_3',
      college_id: 'col_global',
      document_type: 'Provisional Certificate',
      title: 'Provisional Graduation Certificate',
      file_path: '',
      file_name: 'Provisional_Cert_Rohan.pdf',
      file_size: 290000,
      mime_type: 'application/pdf',
      status: 'NEEDS_REVIEW',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_global',
      upload_date: '2026-09-17T16:00:00.000Z'
    },

    // Ananya Iyer (Global Univ)
    {
      id: 'doc_401',
      student_id: 'stu_4',
      college_id: 'col_global',
      document_type: 'Degree Certificate',
      title: 'B.Sc Electronics & Communication Degree',
      file_path: '',
      file_name: 'Degree_ECE_Ananya_Iyer.pdf',
      file_size: 440000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_global',
      upload_date: '2026-05-05T09:40:00.000Z'
    },
    {
      id: 'doc_402',
      student_id: 'stu_4',
      college_id: 'col_global',
      document_type: '10th Certificate',
      title: 'Secondary Education Board Certificate (Class X)',
      file_path: '',
      file_name: '10th_Board_Ananya_Iyer.pdf',
      file_size: 310000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_global',
      upload_date: '2026-05-05T10:00:00.000Z'
    },

    // Vikram Sen (Sunrise - Includes AI Suspicious Mismatch Demo Certificate)
    {
      id: 'doc_501',
      student_id: 'stu_5',
      college_id: 'col_sunrise',
      document_type: 'Degree Certificate',
      title: 'Data Science Certificate (Suspicious Scan Test Sample)',
      file_path: '',
      file_name: 'Suspicious_Mismatch_Sample_Scan.pdf',
      file_size: 350000,
      mime_type: 'application/pdf',
      status: 'REJECTED',
      physical_issue_details: null,
      uploaded_by: 'usr_superadmin',
      upload_date: '2026-09-15T11:20:00.000Z'
    },

    // Kavya Reddy (TKREC)
    {
      id: 'doc_601',
      student_id: 'stu_6',
      college_id: 'col_tkrec',
      document_type: 'Degree Certificate',
      title: 'B.Tech Computer Science & Engg Degree Certificate',
      file_path: '',
      file_name: 'Degree_Certificate_Kavya_Reddy.pdf',
      file_size: 435000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      is_original: true,
      custody_status: 'STORED_IN_COLLEGE_REPOSITORY',
      locker_reference: 'TKREC Exam Cell / Vault Rack 2 / Box 09',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_tkrec',
      upload_date: '2026-04-18T10:00:00.000Z'
    },
    {
      id: 'doc_602',
      student_id: 'stu_6',
      college_id: 'col_tkrec',
      document_type: '10th Certificate',
      title: 'Secondary School Certificate (SSC Class X)',
      file_path: '',
      file_name: 'SSC_Certificate_Kavya_Reddy.pdf',
      file_size: 310000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      is_original: true,
      custody_status: 'STORED_IN_COLLEGE_REPOSITORY',
      locker_reference: 'TKREC Exam Cell / Vault Rack 2 / Box 09',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_tkrec',
      upload_date: '2026-04-18T10:15:00.000Z'
    },

    // Sai Teja (TKREC)
    {
      id: 'doc_701',
      student_id: 'stu_7',
      college_id: 'col_tkrec',
      document_type: 'Degree Certificate',
      title: 'B.Tech Electronics & Comm Degree Certificate',
      file_path: '',
      file_name: 'Degree_Certificate_Sai_Teja.pdf',
      file_size: 420000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      is_original: true,
      custody_status: 'STORED_IN_COLLEGE_REPOSITORY',
      locker_reference: 'TKREC Exam Cell / Vault Rack 2 / Box 14',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_tkrec',
      upload_date: '2026-04-19T09:30:00.000Z'
    },

    // Aditya Varma (CBIT)
    {
      id: 'doc_801',
      student_id: 'stu_8',
      college_id: 'col_cbit',
      document_type: 'Degree Certificate',
      title: 'B.Tech AI & Data Science Degree Certificate',
      file_path: '',
      file_name: 'Degree_Certificate_Aditya_Varma.pdf',
      file_size: 450000,
      mime_type: 'application/pdf',
      status: 'VERIFIED',
      is_original: true,
      custody_status: 'STORED_IN_COLLEGE_REPOSITORY',
      locker_reference: 'CBIT Administrative Archive / Locker 108',
      physical_issue_details: null,
      uploaded_by: 'usr_admin_cbit',
      upload_date: '2026-04-22T11:00:00.000Z'
    }
  ];

  // 5. Verification Records
  const verification_records = [
    {
      id: 'vr_101',
      document_id: 'doc_101',
      verified_by: 'usr_admin_apex',
      verification_status: 'VERIFIED',
      remarks: 'Degree records cross-referenced and verified against University Registrar archives.',
      ai_result: {
        verifiedAt: '2026-04-10T09:05:00.000Z',
        confidenceScore: 98,
        classification: 'CONSISTENT',
        statusBadge: 'CONSISTENT',
        fieldChecks: [
          { field: 'Student Name', official: 'Aarav Sharma', extracted: 'Aarav Sharma', status: 'MATCH', confidence: 100, note: 'Student name matches database records.' },
          { field: 'Roll Number / Reg No', official: 'APEX/CS/22/0101', extracted: 'APEX/CS/22/0101', status: 'MATCH', confidence: 100, note: 'Official roll number verified with zero variance.' },
          { field: 'Issuing Institution', official: 'Apex Institute of Technology', extracted: 'Apex Institute of Technology', status: 'MATCH', confidence: 100, note: 'Issuing institution corresponds to registered college.' },
          { field: 'Degree / Course', official: 'Bachelor of Technology in Computer Science', extracted: 'Bachelor of Technology in Computer Science', status: 'MATCH', confidence: 95, note: 'Academic course curriculum matches enrollment.' },
          { field: 'Institutional Seal & Signature', official: 'Required', extracted: 'Detected', status: 'MATCH', confidence: 95, note: 'Digital signature / institutional seal pattern identified.' }
        ],
        recommendation: 'Document passed all AI cross-verification checks. Recommended for College Admin authorization.',
        disclaimer: 'AI Document Verification assists authorized institutions. Final verification authority remains exclusively with the issuing institution.'
      },
      verified_at: '2026-04-10T09:05:00.000Z'
    },
    {
      id: 'vr_501',
      document_id: 'doc_501',
      verified_by: 'usr_superadmin',
      verification_status: 'REJECTED',
      remarks: 'Rejected: Critical student name and roll number mismatch identified during AI verification scan.',
      ai_result: {
        verifiedAt: '2026-09-15T11:22:00.000Z',
        confidenceScore: 32,
        classification: 'SUSPICIOUS_MISMATCH',
        statusBadge: 'SUSPICIOUS',
        fieldChecks: [
          { field: 'Student Name', official: 'Vikram Sen', extracted: 'Alexander J. Mismatch', status: 'MISMATCH', confidence: 25, note: 'Student name does NOT match registered student record.' },
          { field: 'Roll Number / Reg No', official: 'SUN/DS/23/0301', extracted: 'SUSP-999-XYZ', status: 'MISMATCH', confidence: 10, note: 'Mismatch detected: Official SUN/DS/23/0301 vs Scanned SUSP-999-XYZ.' },
          { field: 'Issuing Institution', official: 'Sunrise Academy of Science & Applied Tech', extracted: 'Sunrise Academy of Science', status: 'MATCH', confidence: 90, note: 'Issuing institution corresponds to registered college.' }
        ],
        recommendation: 'Critical data discrepancies identified against official institutional registry. College Admin review and verification rejection advised.',
        disclaimer: 'AI Document Verification assists authorized institutions. Final verification authority remains exclusively with the issuing institution.'
      },
      verified_at: '2026-09-15T11:25:00.000Z'
    }
  ];

  // 6. Document Requests
  const document_requests = [
    {
      id: 'req_001',
      student_id: 'stu_1',
      college_id: 'col_apex',
      document_type: 'Migration / Transfer Certificate',
      reason: 'Needed for application to Master of Science program at Technical University of Munich.',
      urgent: true,
      request_status: 'APPROVED',
      processed_by: 'usr_admin_apex',
      remarks: 'Approved by Dean office. Digital certificate will be uploaded within 24 hours.',
      request_date: '2026-09-12T10:00:00.000Z',
      updated_at: '2026-09-13T11:30:00.000Z'
    },
    {
      id: 'req_002',
      student_id: 'stu_2',
      college_id: 'col_apex',
      document_type: 'Transfer Certificate',
      reason: 'Required for campus placement onboarding at Microsoft IDC.',
      urgent: false,
      request_status: 'PENDING',
      processed_by: null,
      remarks: null,
      request_date: '2026-09-19T08:30:00.000Z',
      updated_at: '2026-09-19T08:30:00.000Z'
    },
    {
      id: 'req_003',
      student_id: 'stu_3',
      college_id: 'col_global',
      document_type: 'Consolidated Marksheet',
      reason: 'Urgent requirement for Indian Passport Office police verification appointment.',
      urgent: true,
      request_status: 'ISSUED',
      processed_by: 'usr_admin_global',
      remarks: 'Verified & issued digitally. Physical copy also available in registrar counter.',
      request_date: '2026-09-14T09:15:00.000Z',
      updated_at: '2026-09-15T10:00:00.000Z'
    }
  ];

  // 7. Initial Audit Logs
  const audit_logs = [
    {
      id: 'audit_init_1',
      user_id: 'usr_superadmin',
      action: 'COLLEGE_VERIFIED_BADGE_GRANTED',
      entity_type: 'COLLEGE',
      entity_id: 'col_apex',
      ip_address: '192.168.1.10',
      details: JSON.stringify({ college: 'Apex Institute of Technology', reason: 'Accreditation certified' }),
      timestamp: '2026-01-15T10:00:00.000Z'
    },
    {
      id: 'audit_init_2',
      user_id: 'usr_superadmin',
      action: 'COLLEGE_VERIFIED_BADGE_GRANTED',
      entity_type: 'COLLEGE',
      entity_id: 'col_global',
      ip_address: '192.168.1.10',
      details: JSON.stringify({ college: 'Global University of Engineering', reason: 'National accreditation passed' }),
      timestamp: '2026-02-20T11:30:00.000Z'
    },
    {
      id: 'audit_init_3',
      user_id: 'usr_admin_apex',
      action: 'PHYSICAL_CERTIFICATE_ISSUED',
      entity_type: 'DOCUMENT',
      entity_id: 'doc_104',
      ip_address: '10.0.4.12',
      details: JSON.stringify({ issued_to: 'Aarav Sharma', purpose: 'Embassy interview' }),
      timestamp: '2026-09-18T10:00:00.000Z'
    }
  ];

  const fullData = {
    users,
    colleges,
    students,
    documents,
    verification_records,
    document_requests,
    audit_logs,
    settings: {
      systemName: "Student Document Verification & Retrieval System",
      allowStudentRegistrations: true,
      requireAdminCollegeVerification: true,
      aiModel: "Built-in Neural OCR + Verification Agent v2.4",
      maintenanceMode: false
    }
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(fullData, null, 2), 'utf-8');
  console.log('[SEED] Database populated with:');
  console.log(` - ${colleges.length} Colleges`);
  console.log(` - ${users.length} Users (${users.filter(u => u.role === 'STUDENT').length} Students, ${users.filter(u => u.role === 'COLLEGE_ADMIN').length} College Admins, 1 Super Admin)`);
  console.log(` - ${documents.length} Demo Certificates (Verified, Pending, Physical Issued, Suspicious)`);
  console.log(` - ${document_requests.length} Document Requests`);
  console.log(` - ${audit_logs.length} Initial Audit Logs`);
};

// If run directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => {
    console.log('[SEED] Seeding complete.');
    process.exit(0);
  });
}
