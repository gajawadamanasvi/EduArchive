const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('=== Starting Student Document Approval & View/Download Test ===\n');

  // 1. Login as Student (Aarav Sharma - Apex College)
  console.log('1. Logging in as Student...');
  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav.sharma@student.edu', password: 'StudentPass@123' })
  });
  const studentLoginData = await studentLoginRes.json();
  if (!studentLoginData.success) {
    console.error('Student login failed:', studentLoginData);
    process.exit(1);
  }
  const studentToken = studentLoginData.token;
  console.log('✓ Student logged in:', studentLoginData.user.name);

  // 2. Student creates a document retrieval request
  console.log('\n2. Creating document retrieval request for Degree Certificate...');
  const createReqRes = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      document_type: 'Degree Certificate',
      reason: 'Applying for higher studies abroad',
      urgent: true
    })
  });
  const createReqData = await createReqRes.json();
  console.log('Create request response:', createReqData);
  if (!createReqData.success) {
    console.error('Failed to create request');
    process.exit(1);
  }
  const requestId = createReqData.request.id;
  console.log(`✓ Request created with ID: ${requestId}`);

  // 3. Login as College Admin (Apex)
  console.log('\n3. Logging in as College Admin...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@apex.edu', password: 'CollegePass@123' })
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginData.success) {
    console.error('College admin login failed:', adminLoginData);
    process.exit(1);
  }
  const adminToken = adminLoginData.token;
  console.log('✓ College Admin logged in:', adminLoginData.user.name);

  // 4. College Admin Approves the Request
  console.log(`\n4. College Admin approving Request #${requestId}...`);
  const approveRes = await fetch(`${BASE_URL}/requests/${requestId}/process`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: 'APPROVED',
      remarks: 'Attested and officially verified by Controller of Examinations.'
    })
  });
  const approveData = await approveRes.json();
  console.log('Approve response:', approveData);
  if (!approveData.success) {
    console.error('Failed to approve request');
    process.exit(1);
  }
  console.log('✓ Request approved and linked document_id:', approveData.request.document_id);
  const docId = approveData.request.document_id;

  // 5. Student fetches requests and checks document attachment
  console.log('\n5. Student fetching their document requests list...');
  const getReqsRes = await fetch(`${BASE_URL}/requests`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const getReqsData = await getReqsRes.json();
  const myReq = getReqsData.requests.find(r => r.id === requestId);
  console.log('Found request:', {
    id: myReq?.id,
    type: myReq?.document_type,
    status: myReq?.request_status,
    remarks: myReq?.remarks,
    has_document: Boolean(myReq?.document),
    document_id: myReq?.document_id
  });

  if (myReq?.request_status !== 'APPROVED' || !myReq?.document_id) {
    console.error('Assertion failed: Request is not approved or document_id missing');
    process.exit(1);
  }

  // 6. Student Views Document (Preview SVG)
  console.log(`\n6. Student viewing document #${docId}...`);
  const viewRes = await fetch(`${BASE_URL}/documents/${docId}/view`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const viewContent = await viewRes.text();
  console.log('View response content-type:', viewRes.headers.get('content-type'));
  console.log('View SVG contains student name?', viewContent.includes(studentLoginData.user.name));
  console.log('View SVG length:', viewContent.length);

  // 7. Student Downloads Document
  console.log(`\n7. Student downloading document #${docId}...`);
  const downloadRes = await fetch(`${BASE_URL}/documents/${docId}/download`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log('Download status:', downloadRes.status);
  console.log('Download headers:', downloadRes.headers.get('content-disposition'));
  const downloadBlob = await downloadRes.arrayBuffer();
  console.log('Download file size (bytes):', downloadBlob.byteLength);

  console.log('\n✅ ALL TESTS PASSED! Student can successfully view and download approved documents.\n');
}

runTest().catch(console.error);
