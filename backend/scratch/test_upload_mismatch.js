import db from '../src/config/db.js';
import { verifyDocumentWithAI } from '../src/ai/verificationAgent.js';

async function testUploadMismatch() {
  console.log('Testing upload verification with student identity cross-check...');

  // Student A: Aarav Sharma
  const studentA = db.findOne('students', s => {
    const u = db.findById('users', s.user_id);
    return (u?.name || '').includes('Aarav');
  }) || db.find('students')[0];
  const userA = db.findById('users', studentA.user_id);

  console.log(`Target Student A (Selected in Portal): '${userA?.name}' (Roll: ${studentA.roll_number})`);

  // Scenario 1: Uploading Certificate of Student B (Manasvi)
  const ocrStudentB = `GOVERNMENT ACCREDITED ACADEMIC REPOSITORY
OFFICIAL DEGREE CERTIFICATE
Institution: Apex Institute of Technology
Student Name: Manasvi Gajawada
Roll No: APEX/CS/22/9999
Degree: Bachelor of Technology
Specialization: Computer Science
Grading: First Class with Distinction
OFFICIAL CONTROLLER OF EXAMINATIONS`;

  const resultB = await verifyDocumentWithAI({
    documentId: 'test_doc_mismatch',
    filePath: '',
    fileName: 'Manasvi_Gajawada_Degree.pdf',
    documentType: 'Degree Certificate',
    studentId: studentA.id,
    collegeId: studentA.college_id,
    customOcrText: ocrStudentB
  });

  console.log('\n--- Result for uploading B\'s certificate for Student A ---');
  console.log('Classification:', resultB.classification);
  console.log('Status Badge:', resultB.statusBadge);
  console.log('Confidence Score:', resultB.confidenceScore + '%');
  console.log('Recommendation:', resultB.recommendation);
  console.log('Field Checks:');
  resultB.fieldChecks.forEach(fc => console.log(`  - ${fc.field}: Official '${fc.official}' vs Scanned '${fc.extracted}' -> [${fc.status}] (${fc.confidence}%)`));

  // Scenario 2: Uploading Certificate of Student A (Aarav Sharma)
  const ocrStudentA = `GOVERNMENT ACCREDITED ACADEMIC REPOSITORY
OFFICIAL DEGREE CERTIFICATE
Institution: Apex Institute of Technology
Student Name: ${userA?.name || 'Aarav Sharma'}
Roll No: ${studentA.roll_number || 'APEX/CS/22/0101'}
Degree: Bachelor of Technology in Computer Science
Grading: First Class with Distinction
OFFICIAL CONTROLLER OF EXAMINATIONS`;

  const resultA = await verifyDocumentWithAI({
    documentId: 'test_doc_match',
    filePath: '',
    fileName: 'Aarav_Sharma_Degree.pdf',
    documentType: 'Degree Certificate',
    studentId: studentA.id,
    collegeId: studentA.college_id,
    customOcrText: ocrStudentA
  });

  console.log('\n--- Result for uploading A\'s certificate for Student A ---');
  console.log('Classification:', resultA.classification);
  console.log('Status Badge:', resultA.statusBadge);
  console.log('Confidence Score:', resultA.confidenceScore + '%');
  console.log('Field Checks:');
  resultA.fieldChecks.forEach(fc => console.log(`  - ${fc.field}: Official '${fc.official}' vs Scanned '${fc.extracted}' -> [${fc.status}] (${fc.confidence}%)`));
}

testUploadMismatch().catch(console.error);
