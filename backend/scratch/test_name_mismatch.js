import { verifyDocumentWithAI } from '../src/ai/verificationAgent.js';
import db from '../src/config/db.js';

async function testNameMismatch() {
  console.log('Testing Name Mismatch Detection...');

  // 1. Get official student Aarav Sharma from DB
  const student = db.findOne('students', s => {
    const u = db.findById('users', s.user_id);
    return (u?.name || '').includes('Aarav');
  }) || db.find('students')[0];

  const studentUser = db.findById('users', student.user_id);
  console.log(`Official Student in DB: Name='${studentUser?.name}', Roll='${student.roll_number}'`);

  // 2. Simulate OCR text from a certificate that has a DIFFERENT student name (e.g. Manasvi)
  const ocrForManasvi = `GOVERNMENT ACCREDITED ACADEMIC REPOSITORY
OFFICIAL DEGREE CERTIFICATE
Institution: Apex Institute of Technology
Candidate Name: Manasvi
Roll No: APEX/CS/22/9999
Degree: Bachelor of Technology
Specialization: Computer Science
Grading: First Class with Distinction`;

  console.log('\n--- Scenario A: Passing Custom OCR with Manasvi on Aarav record ---');
  const resultA = await verifyDocumentWithAI({
    documentId: 'simulation_test_1',
    filePath: '',
    fileName: 'degree_certificate.pdf',
    documentType: 'Degree Certificate',
    studentId: student.id,
    collegeId: student.college_id,
    customOcrText: ocrForManasvi
  });

  console.log('Result A Classification:', resultA.classification);
  console.log('Result A Confidence Score:', resultA.confidenceScore);
  console.log('Result A Status Badge:', resultA.statusBadge);
  console.log('Result A Field Checks:');
  resultA.fieldChecks.forEach(fc => console.log(`  - [${fc.status}] ${fc.field}: ${fc.official || ''} vs ${fc.extracted || ''} (${fc.note || ''})`));

  console.log('\n--- Scenario B: Uploading file named Manasvi_Degree_Certificate.pdf for Aarav ---');
  const resultB = await verifyDocumentWithAI({
    documentId: 'simulation_test_2',
    filePath: '',
    fileName: 'Manasvi_Degree_Certificate.pdf',
    documentType: 'Degree Certificate',
    studentId: student.id,
    collegeId: student.college_id
  });

  console.log('Result B Classification:', resultB.classification);
  console.log('Result B Confidence Score:', resultB.confidenceScore);
  console.log('Result B Status Badge:', resultB.statusBadge);
  console.log('Result B Field Checks:');
  resultB.fieldChecks.forEach(fc => console.log(`  - [${fc.status}] ${fc.field}: ${fc.official || ''} vs ${fc.extracted || ''} (${fc.note || ''})`));

  console.log('\n--- Scenario C: Uploading file matching Aarav ---');
  const resultC = await verifyDocumentWithAI({
    documentId: 'simulation_test_3',
    filePath: '',
    fileName: 'Aarav_Sharma_Degree.pdf',
    documentType: 'Degree Certificate',
    studentId: student.id,
    collegeId: student.college_id
  });

  console.log('Result C Classification:', resultC.classification);
  console.log('Result C Confidence Score:', resultC.confidenceScore);
  console.log('Result C Status Badge:', resultC.statusBadge);
}

testNameMismatch().catch(console.error);
