import { getStudentProfileTool } from '../tools/studentTools.js';
import { getStudentDocumentsTool, searchDocumentsTool } from '../tools/documentTools.js';
import { getPendingRequestsTool } from '../tools/verificationTools.js';
import db from '../../config/db.js';
import { getSuggestedQuestions } from '../../ai/chatbotService.js';

/**
 * Retrieval Agent Node
 * Resolves queries using controlled backend tools with strict RBAC boundary checks.
 */
export const retrievalAgent = async (state) => {
  const caller = {
    userId: state.userId,
    userRole: state.userRole,
    userCollegeId: state.userCollegeId,
    studentId: state.studentId
  };

  const query = (state.userRequest || '').trim();
  const intent = state.intent;
  const toolResults = [];
  const steps = [];
  let finalResponse = '';
  let actions = [];

  try {
    if (intent === 'DOCUMENT_SEARCH') {
      if (caller.userRole === 'STUDENT') {
        const docResult = await getStudentDocumentsTool({ caller });
        toolResults.push({ tool: 'getStudentDocumentsTool', result: docResult });

        if (docResult.success) {
          const docs = docResult.data.documents || [];
          const verified = docs.filter(d => d.status === 'VERIFIED');
          const pending = docs.filter(d => d.status === 'PENDING' || d.status === 'NEEDS_REVIEW');

          steps.push(`✓ Retrieved ${docs.length} authorized student records`);

          finalResponse = `You currently have **${docs.length} total certificates** in the repository:\n- ✅ **${verified.length} Verified**\n- ⏳ **${pending.length} Pending / Under Review**\n\nYou can access or download verified certificates from the documents tab.`;
          actions = [
            { label: "Go to My Documents", route: "/student/documents", variant: "primary" },
            { label: "View Verification Status", route: "/student/verification", variant: "secondary" }
          ];
        } else {
          finalResponse = docResult.error || "Unable to access document records.";
        }
      } else if (caller.userRole === 'COLLEGE_ADMIN') {
        const searchResult = await searchDocumentsTool({ caller, queryText: query });
        toolResults.push({ tool: 'searchDocumentsTool', result: searchResult });
        steps.push(`✓ Searched institutional repository`);

        finalResponse = `Found **${searchResult.data?.count || 0} matching document records** in your college repository.`;
        actions = [
          { label: "Open College Documents", route: "/college/documents", variant: "primary" }
        ];
      } else {
        finalResponse = "Please log in with an authorized student or college administrator account to retrieve documents.";
        actions = [
          { label: "Go to Login", route: "/login", variant: "primary" }
        ];
      }
    } else if (intent === 'STUDENT_REQUEST_STATUS') {
      const reqResult = await getPendingRequestsTool({ caller });
      toolResults.push({ tool: 'getPendingRequestsTool', result: reqResult });
      steps.push(`✓ Retrieved pending application requests`);

      if (reqResult.success) {
        const reqs = reqResult.data.requests || [];
        const pendingCount = reqs.filter(r => r.status === 'PENDING').length;
        const approvedCount = reqs.filter(r => r.status === 'APPROVED' || r.status === 'ISSUED').length;

        finalResponse = `You have **${reqs.length} total document requests** on record:\n- ⏳ **${pendingCount} Pending Processing**\n- ✅ **${approvedCount} Approved / Issued**\n\nCollege administration will review any pending requests.`;
        actions = [
          { label: caller.userRole === 'COLLEGE_ADMIN' ? "Manage Requests" : "My Requests", route: caller.userRole === 'COLLEGE_ADMIN' ? "/college/requests" : "/student/requests", variant: "primary" }
        ];
      } else {
        finalResponse = reqResult.error || "Could not retrieve request history.";
      }
    } else if (intent === 'CERTIFICATE_GENERATION') {
      steps.push(`✓ Navigated to certificate application workflow`);
      const route = caller.userRole === 'COLLEGE_ADMIN' ? '/college/upload' : '/student/requests';
      finalResponse = caller.userRole === 'COLLEGE_ADMIN'
        ? "College Administrators can issue, upload, or AI-verify new student certificates in the **Upload Certificate** portal."
        : "You can apply for provisional certificates, transcripts, or transfer certificates from the **Document Requests** section.";
      actions = [
        { label: caller.userRole === 'COLLEGE_ADMIN' ? "Upload & Verify Certificate" : "Submit Certificate Request", route, variant: "primary" }
      ];
    } else if (intent === 'ADMIN_ANALYTICS') {
      steps.push(`✓ Queried system analytics & institutional metrics`);
      const totalColleges = db.count('colleges');
      const totalStudents = db.count('students');
      const totalDocs = db.count('documents');
      const verifiedDocs = db.count('documents', d => d.status === 'VERIFIED');

      finalResponse = `**EduArchive Platform Metrics:**\n- 🏛️ **${totalColleges} Registered Colleges**\n- 🎓 **${totalStudents} Enrolled Students**\n- 📄 **${totalDocs} Total Certificates** (${verifiedDocs} Verified)\n\nAudit logging and real-time security tracking remain active across all nodes.`;
      actions = [
        { label: caller.userRole === 'SUPER_ADMIN' ? "View Audit Logs" : "Dashboard Overview", route: caller.userRole === 'SUPER_ADMIN' ? "/admin/logs" : "/college/dashboard", variant: "primary" }
      ];
    } else {
      // General information
      steps.push(`✓ Processed general information request`);
      finalResponse = "**EduArchive** is a secure institutional document repository platform. It enables universities and colleges to securely store, verify, and track academic certificates digitally with AI OCR cross-referencing.";
      actions = [
        { label: "Go to Dashboard", route: caller.userRole === 'COLLEGE_ADMIN' ? '/college/dashboard' : (caller.userRole === 'SUPER_ADMIN' ? '/admin/dashboard' : '/student/dashboard'), variant: "primary" }
      ];
    }

    return {
      toolResults,
      steps,
      retrievedData: toolResults.map(t => t.result),
      finalResponse,
      actions
    };
  } catch (err) {
    return {
      errors: [err.message],
      finalResponse: "An unexpected error occurred while retrieving authorized records.",
      actions: []
    };
  }
};
