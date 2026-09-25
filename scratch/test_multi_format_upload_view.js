import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';

async function runMultiFormatTest() {
  console.log('=== Testing Multi-Format (PDF / Image) Upload, View & Download ===\n');

  // Create mock PDF and PNG files
  const testPdfPath = path.resolve('scratch/sample_marksheet.pdf');
  const testPngPath = path.resolve('scratch/sample_id_card.png');

  fs.writeFileSync(testPdfPath, '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n180\n%%EOF');
  
  // 1x1 transparent PNG bytes
  const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(testPngPath, pngBuffer);

  // 1. Login as Student
  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav.sharma@student.edu', password: 'StudentPass@123' })
  });
  const studentData = await studentLoginRes.json();
  const studentToken = studentData.token;
  console.log('✓ Student logged in:', studentData.user.name);

  // 2. Test PDF upload via FormData (Document Request)
  console.log('\n--- 1. Testing Student PDF Upload & Request ---');
  const pdfBlob = new Blob([fs.readFileSync(testPdfPath)], { type: 'application/pdf' });
  const pdfFormData = new FormData();
  pdfFormData.append('document_type', 'Marksheet');
  pdfFormData.append('reason', 'Need official attestation of semester marksheet');
  pdfFormData.append('file', pdfBlob, 'Semester_1_Marksheet.pdf');

  const pdfReqRes = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` },
    body: pdfFormData
  });
  const pdfReqData = await pdfReqRes.json();
  console.log('PDF request response:', pdfReqData.success, pdfReqData.request?.file_name);
  const pdfRequestId = pdfReqData.request.id;

  // 3. College Admin Approves PDF Request
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@apex.edu', password: 'CollegePass@123' })
  });
  const adminData = await adminLoginRes.json();
  const adminToken = adminData.token;

  const approvePdfRes = await fetch(`${BASE_URL}/requests/${pdfRequestId}/process`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'APPROVED', remarks: 'Marksheet verified against records' })
  });
  const approvePdfData = await approvePdfRes.json();
  const pdfDocId = approvePdfData.request.document_id;
  console.log('✓ PDF request approved, linked document ID:', pdfDocId);

  // 4. Check View of PDF Document
  const viewPdfRes = await fetch(`${BASE_URL}/documents/${pdfDocId}/view`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log('PDF View Content-Type:', viewPdfRes.headers.get('content-type'));
  if (!viewPdfRes.headers.get('content-type')?.includes('application/pdf')) {
    console.error('ERROR: Expected Content-Type application/pdf but got:', viewPdfRes.headers.get('content-type'));
    process.exit(1);
  }

  // 5. Check Download of PDF Document
  const downloadPdfRes = await fetch(`${BASE_URL}/documents/${pdfDocId}/download`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log('PDF Download Content-Disposition:', downloadPdfRes.headers.get('content-disposition'));

  // 6. Test PNG Image Upload (Document Request)
  console.log('\n--- 2. Testing Student PNG Image Upload & Request ---');
  const pngBlob = new Blob([fs.readFileSync(testPngPath)], { type: 'image/png' });
  const pngFormData = new FormData();
  pngFormData.append('document_type', 'Bonafide / Character Certificate');
  pngFormData.append('reason', 'Internship requirement');
  pngFormData.append('file', pngBlob, 'College_Bonafide.png');

  const pngReqRes = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` },
    body: pngFormData
  });
  const pngReqData = await pngReqRes.json();
  console.log('PNG request response:', pngReqData.success, pngReqData.request?.file_name);
  const pngRequestId = pngReqData.request.id;

  // 7. College Admin Approves Image Request
  const approvePngRes = await fetch(`${BASE_URL}/requests/${pngRequestId}/process`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'APPROVED', remarks: 'Bonafide certificate issued' })
  });
  const approvePngData = await approvePngRes.json();
  const pngDocId = approvePngData.request.document_id;
  console.log('✓ PNG request approved, linked document ID:', pngDocId);

  // 8. Check View of PNG Document
  const viewPngRes = await fetch(`${BASE_URL}/documents/${pngDocId}/view`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log('PNG View Content-Type:', viewPngRes.headers.get('content-type'));
  if (!viewPngRes.headers.get('content-type')?.includes('image/')) {
    console.error('ERROR: Expected Content-Type image/png but got:', viewPngRes.headers.get('content-type'));
    process.exit(1);
  }

  // 9. Check Download of PNG Document
  const downloadPngRes = await fetch(`${BASE_URL}/documents/${pngDocId}/download`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log('PNG Download Content-Disposition:', downloadPngRes.headers.get('content-disposition'));

  console.log('\n✅ ALL MULTI-FORMAT TESTS PASSED! PDF appears as PDF, and Image appears as Image.\n');
}

runMultiFormatTest().catch(console.error);
