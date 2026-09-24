import db from '../config/db.js';

export const getSuggestedQuestions = (role = 'STUDENT') => {
  const common = [
    "What is this application?",
    "How do I retrieve my certificate?",
    "What does Verified mean?",
    "Why is my certificate pending?",
    "How can I request a document?",
    "How does AI verification work?"
  ];

  if (role === 'STUDENT') {
    return [
      ...common,
      "Where can I see my certificates?",
      "How do I contact my college?",
      "How many documents do I have in the repository?"
    ];
  }

  if (role === 'COLLEGE_ADMIN') {
    return [
      "How do I upload and verify a student certificate?",
      "How does AI OCR cross-referencing work?",
      "How do I record a temporary physical certificate issuance?",
      "Where do I process student document requests?",
      "How to get the '✓ Verified College' badge?"
    ];
  }

  if (role === 'SUPER_ADMIN') {
    return [
      "How do I grant the '✓ Verified College' badge?",
      "How are audit logs recorded across the platform?",
      "What security mechanisms protect student privacy?"
    ];
  }

  return common;
};

export const processChatQuery = async ({ message, user = null, student = null }) => {
  const query = (message || '').trim().toLowerCase();

  // Safety & Privacy Guardrail
  if (!query) {
    return {
      reply: "Hello! I am DocumentAssist AI. How can I assist you with your academic documents and verification today?",
      actions: [],
      suggestedQuestions: getSuggestedQuestions(user?.role)
    };
  }

  // Personal Context calculations if student is logged in
  let studentDocStats = null;
  if (user?.role === 'STUDENT' && student) {
    const myDocs = db.find('documents', d => String(d.student_id) === String(student.id));
    const verifiedDocs = myDocs.filter(d => d.status === 'VERIFIED');
    const pendingDocs = myDocs.filter(d => d.status === 'PENDING' || d.status === 'NEEDS_REVIEW');
    const requests = db.find('document_requests', r => String(r.student_id) === String(student.id));
    studentDocStats = {
      total: myDocs.length,
      verified: verifiedDocs.length,
      pending: pendingDocs.length,
      requests: requests.length
    };
  }

  // 1. Personalized dynamic questions
  if (query.includes('how many document') || query.includes('my document count') || query.includes('my status')) {
    if (user?.role === 'STUDENT' && studentDocStats) {
      return {
        reply: `You currently have **${studentDocStats.total} total certificates** registered in the repository:\n- ✅ **${studentDocStats.verified} Verified**\n- ⏳ **${studentDocStats.pending} Pending Review**\n- 📋 **${studentDocStats.requests} Document Requests submitted**.\n\nYou can view and download all verified certificates anytime!`,
        actions: [
          { label: "Go to My Documents", route: "/student/documents", variant: "primary" },
          { label: "View Verification Status", route: "/student/verification", variant: "secondary" }
        ]
      };
    }
  }

  // 2. Navigation Intent: Where to see certificates / documents
  if (query.includes('where can i see my certificate') || query.includes('see my certificates') || query.includes('view certificate') || query.includes('find my documents')) {
    return {
      reply: "You can view, inspect, and download all authorized digital certificates directly from the **My Documents** page in your sidebar navigation.",
      actions: [
        { label: "Go to My Documents", route: "/student/documents", variant: "primary" }
      ]
    };
  }

  // 3. Navigation Intent: Request certificate
  if (query.includes('request a document') || query.includes('request certificate') || query.includes('how can i request') || query.includes('apply for certificate')) {
    const route = user?.role === 'COLLEGE_ADMIN' ? '/college/requests' : '/student/requests';
    return {
      reply: user?.role === 'COLLEGE_ADMIN' 
        ? "College Administrators can manage and process incoming student document requests from the **Document Requests** dashboard tab."
        : "You can submit an official request for certificates (e.g. 10th, 12th, Degree, Marksheet, Transfer Certificate) from the **Document Requests** section. Your college administration will review and process your request.",
      actions: [
        { label: user?.role === 'COLLEGE_ADMIN' ? "Manage Requests" : "Submit Document Request", route, variant: "primary" }
      ]
    };
  }

  // 4. Navigation Intent: Pending documents / verification status
  if (query.includes('pending') || query.includes('why is my certificate pending') || query.includes('verification status')) {
    if (user?.role === 'COLLEGE_ADMIN') {
      return {
        reply: "To review certificates pending institutional verification or flagged for manual check, open the **Verification** workspace.",
        actions: [
          { label: "Open Verification Queue", route: "/college/verification", variant: "primary" }
        ]
      };
    }
    return {
      reply: "Certificates remain in **Pending** status until your registered college administration uploads and formally verifies the digital scan. You can monitor the real-time status under **Verification Status**.",
      actions: [
        { label: "Check Verification Status", route: "/student/verification", variant: "primary" }
      ]
    };
  }

  // 5. Navigation Intent: Profile / Edit safe info
  if (query.includes('profile') || query.includes('change phone') || query.includes('edit profile') || query.includes('update my info')) {
    return {
      reply: "You can view your student profile details and update safe fields (such as phone and profile settings) under **My Profile**. Official institutional identifiers like Student ID and Roll Number require college authorization.",
      actions: [
        { label: "Go to My Profile", route: "/student/profile", variant: "primary" }
      ]
    };
  }

  // 6. Navigation Intent: Upload Certificate (College Admin)
  if (query.includes('upload') || query.includes('how do i upload')) {
    if (user?.role === 'COLLEGE_ADMIN') {
      return {
        reply: "College Administrators can upload student certificates and immediately run an automated AI OCR scan by visiting the **Upload Certificate** portal.",
        actions: [
          { label: "Upload & Verify Certificate", route: "/college/upload", variant: "primary" }
        ]
      };
    } else {
      return {
        reply: "For security and official accreditation, students cannot directly upload unverified certificates. Certificates are officially uploaded and digitally verified by your registered college administration.",
        actions: [
          { label: "Request Certificate from College", route: "/student/requests", variant: "primary" }
        ]
      };
    }
  }

  // 7. General Application Knowledge: What is this application?
  if (query.includes('what is this') || query.includes('about this system') || query.includes('purpose') || query.includes('overview')) {
    return {
      reply: "**Student Document Verification and Retrieval System** is a secure institutional repository platform. It enables colleges to securely store, verify, and track academic certificates digitally. Students can access authenticated digital copies anytime for job applications, internships, higher education, passport verification, and government services without physical delays.",
      actions: [
        { label: "Explore Dashboard", route: user?.role === 'COLLEGE_ADMIN' ? '/college/dashboard' : (user?.role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/student/dashboard'), variant: "primary" }
      ]
    };
  }

  // 8. How does AI verification work?
  if (query.includes('how does ai verification work') || query.includes('ocr') || query.includes('ai verification') || query.includes('how ai works')) {
    return {
      reply: "The **AI Document Verification Agent** works in 6 systematic steps:\n1. **OCR Extraction**: Scans the uploaded certificate image or PDF.\n2. **Entity Recognition**: Identifies Student Name, Roll Number, College, Degree, and Passing Year.\n3. **Database Cross-Referencing**: Matches extracted fields against the authorized institutional database.\n4. **Anomaly Classification**: Detects data mismatches, spelling distortions, and tampered records.\n5. **Classification**: Generates 🟢 Consistent, 🟡 Needs Review, or 🔴 Suspicious verdict.\n6. **Human-in-the-loop**: Delivers structured recommendations while keeping final authority with the institution.",
      actions: user?.role === 'COLLEGE_ADMIN' ? [{ label: "Try AI Verification", route: "/college/upload", variant: "primary" }] : []
    };
  }

  // 9. Verified College Badge
  if (query.includes('verified college') || query.includes('badge') || query.includes('accreditation')) {
    return {
      reply: "The **✓ Verified College** badge signifies that an academic institution has undergone strict vetting and official platform verification. Only platform **Super Administrators** have the cryptographic authority to grant or revoke verified badges.",
      actions: user?.role === 'SUPER_ADMIN' ? [{ label: "Manage Colleges", route: "/admin/colleges", variant: "primary" }] : []
    };
  }

  // 10. Physical Certificate Issuance
  if (query.includes('physical certificate') || query.includes('temporarily issued') || query.includes('issued physical')) {
    return {
      reply: "When a student temporarily borrows their physical certificate (e.g. for urgent visa or interview verification), College Admins log the issuance date, purpose, and expected return in the system. The digital record updates to 'Physical Certificate Issued' with full audit history while remaining visible to the student.",
      actions: user?.role === 'COLLEGE_ADMIN' ? [{ label: "Manage Documents", route: "/college/documents", variant: "primary" }] : []
    };
  }

  // 11. What does Verified mean?
  if (query.includes('what does verified mean') || query.includes('verified status')) {
    return {
      reply: "**✓ Verified** indicates that the digital certificate has been formally uploaded, cross-checked against institutional records with AI OCR assistance, and authenticated by the authorized college administration. It is suitable for official digital submission.",
      actions: []
    };
  }

  // 12. Unrelated query safety rejection
  const relevantKeywords = ['document', 'certificate', 'verify', 'verification', 'college', 'student', 'admin', 'marksheet', 'transcript', 'system', 'login', 'audit', 'download', 'upload', 'profile', 'request', 'status', 'help'];
  const isRelevant = relevantKeywords.some(kw => query.includes(kw));

  if (!isRelevant) {
    return {
      reply: "I can only assist with questions related to the **Student Document Verification and Retrieval System**, including certificate retrieval, AI verification workflows, institutional statuses, and dashboard navigation.",
      actions: []
    };
  }

  return {
    reply: `I understand you are asking about "${message}". You can manage all your academic records directly through your dashboard. Let me know if you need help with certificate downloads, verification status, or submitting document requests!`,
    actions: [
      { label: "View Dashboard", route: user?.role === 'COLLEGE_ADMIN' ? '/college/dashboard' : '/student/dashboard', variant: "primary" }
    ]
  };
};
