/**
 * Tool Selector Node
 * Orchestrates dynamic tool selection based on caller context, intent, and missing data.
 */
export const toolSelectorNode = async (state) => {
  const intent = state.intent;
  const selectedTools = [];
  const toolParameters = {};

  if (intent === 'DOCUMENT_VERIFICATION' || intent === 'DOCUMENT_ANALYSIS') {
    if (state.studentId || state.userId) {
      selectedTools.push('getStudentProfileTool');
      toolParameters['getStudentProfileTool'] = {
        targetStudentId: state.studentId
      };
    }
    if (state.documentId && state.documentId !== 'simulation_test') {
      selectedTools.push('getDocumentDetailsTool');
      toolParameters['getDocumentDetailsTool'] = {
        documentId: state.documentId
      };
    }
  } else if (intent === 'DOCUMENT_SEARCH') {
    if (state.userRole === 'STUDENT') {
      selectedTools.push('getStudentDocumentsTool');
      toolParameters['getStudentDocumentsTool'] = {
        targetStudentId: state.studentId
      };
    } else {
      selectedTools.push('searchDocumentsTool');
      toolParameters['searchDocumentsTool'] = {
        queryText: state.userRequest
      };
    }
  } else if (intent === 'STUDENT_REQUEST_STATUS') {
    selectedTools.push('getPendingRequestsTool');
    toolParameters['getPendingRequestsTool'] = {
      studentId: state.studentId
    };
  }

  const toolNames = selectedTools.join(', ') || 'None required';

  return {
    selectedTools,
    toolParameters,
    steps: [`✓ Tool Selector: Determined required tools [${toolNames}]`]
  };
};
