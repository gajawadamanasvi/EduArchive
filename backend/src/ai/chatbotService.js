import db from '../config/db.js';
import { runEduArchiveWorkflow } from '../agents/index.js';

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
  const query = (message || '').trim();

  // Safety & Privacy Guardrail for empty message
  if (!query) {
    return {
      reply: "Hello! I am DocumentAssist AI. How can I assist you with your academic documents and verification today?",
      actions: [],
      steps: [],
      suggestedQuestions: getSuggestedQuestions(user?.role)
    };
  }

  try {
    // 1. Invoke LangGraph Agentic Workflow
    const graphResult = await runEduArchiveWorkflow({
      userId: user?.id || null,
      userRole: user?.role || 'ANONYMOUS',
      userName: user?.name || null,
      userCollegeId: user?.college_id || null,
      studentId: student?.id || null,
      userRequest: query
    });

    if (graphResult.success && graphResult.finalResponse) {
      return {
        reply: graphResult.finalResponse,
        actions: graphResult.actions || [],
        steps: graphResult.steps || [],
        intent: graphResult.intent,
        requiresHumanReview: graphResult.requiresHumanReview || false
      };
    }
  } catch (agentErr) {
    console.warn('[LangGraph Orchestrator Warn]: Fallback triggered:', agentErr.message);
  }

  // 2. Safe deterministic fallback if LangGraph encounters an edge exception
  return fallbackQueryResolver({ message, user, student });
};

// Deterministic rule-based fallback
function fallbackQueryResolver({ message, user, student }) {
  const query = (message || '').trim().toLowerCase();

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

  if (query.includes('how many document') || query.includes('my document count') || query.includes('my status')) {
    if (user?.role === 'STUDENT' && studentDocStats) {
      return {
        reply: `You currently have **${studentDocStats.total} total certificates** registered in the repository:\n- ✅ **${studentDocStats.verified} Verified**\n- ⏳ **${studentDocStats.pending} Pending Review**\n- 📋 **${studentDocStats.requests} Document Requests submitted**.\n\nYou can view and download all verified certificates anytime!`,
        actions: [
          { label: "Go to My Documents", route: "/student/documents", variant: "primary" },
          { label: "View Verification Status", route: "/student/verification", variant: "secondary" }
        ],
        steps: ['✓ Deterministic fallback: Retrieved student document count']
      };
    }
  }

  if (query.includes('where can i see my certificate') || query.includes('see my certificates') || query.includes('view certificate') || query.includes('find my documents')) {
    return {
      reply: "You can view, inspect, and download all authorized digital certificates directly from the **My Documents** page in your sidebar navigation.",
      actions: [
        { label: "Go to My Documents", route: "/student/documents", variant: "primary" }
      ],
      steps: ['✓ Deterministic fallback: Routed to My Documents']
    };
  }

  if (query.includes('request a document') || query.includes('request certificate') || query.includes('how can i request') || query.includes('apply for certificate')) {
    const route = user?.role === 'COLLEGE_ADMIN' ? '/college/requests' : '/student/requests';
    return {
      reply: user?.role === 'COLLEGE_ADMIN' 
        ? "College Administrators can manage and process incoming student document requests from the **Document Requests** dashboard tab."
        : "You can submit an official request for certificates (e.g. 10th, 12th, Degree, Marksheet, Transfer Certificate) from the **Document Requests** section. Your college administration will review and process your request.",
      actions: [
        { label: user?.role === 'COLLEGE_ADMIN' ? "Manage Requests" : "Submit Document Request", route, variant: "primary" }
      ],
      steps: ['✓ Deterministic fallback: Routed to Document Requests']
    };
  }

  return {
    reply: `I understand you are asking about "${message}". You can manage all your academic records directly through your dashboard. Let me know if you need help with certificate downloads, verification status, or submitting document requests!`,
    actions: [
      { label: "View Dashboard", route: user?.role === 'COLLEGE_ADMIN' ? '/college/dashboard' : '/student/dashboard', variant: "primary" }
    ],
    steps: ['✓ General information response provided']
  };
}
