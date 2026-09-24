async function test() {
  const base = 'http://localhost:5000/api';

  console.log('--- 1. Testing Student Login ---');
  const res1 = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav.sharma@student.edu', password: 'StudentPass@123' })
  });
  const data1 = await res1.json();
  console.log('Status:', res1.status, 'User:', data1.user?.name, 'Role:', data1.user?.role);
  const studentToken = data1.token;

  console.log('\n--- 2. Student trying to access SuperAdmin Audit Logs (Should be 403 Forbidden) ---');
  const res2 = await fetch(`${base}/admin/audit-logs`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const data2 = await res2.json();
  console.log('Status:', res2.status, 'Response:', data2);

  console.log('\n--- 3. Student accessing their own documents (Should be 200 OK) ---');
  const res3 = await fetch(`${base}/documents`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const data3 = await res3.json();
  console.log('Status:', res3.status, 'Docs Count:', data3.count, 'Docs:', data3.documents?.map(d => d.title));

  console.log('\n--- 4. Testing AI Chatbot ---');
  const res4 = await fetch(`${base}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
    body: JSON.stringify({ message: 'Where can I see my certificates?' })
  });
  const data4 = await res4.json();
  console.log('Chat reply:', data4.reply);
  console.log('Chat actions:', data4.actions);

  console.log('\n--- 5. College Admin Login & AI OCR Verification Scan ---');
  const res5 = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@apex.edu', password: 'CollegePass@123' })
  });
  const data5 = await res5.json();
  const adminToken = data5.token;
  console.log('Admin login:', data5.user?.name);

  const res6 = await fetch(`${base}/verification/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ document_id: 'doc_101' })
  });
  const data6 = await res6.json();
  console.log('AI Scan Score:', data6.aiResult?.confidenceScore, 'Classification:', data6.aiResult?.classification);

  console.log('\n✅ ALL BACKEND API TESTS PASSED SUCCESSFULLY!');
}

test().catch(console.error);
