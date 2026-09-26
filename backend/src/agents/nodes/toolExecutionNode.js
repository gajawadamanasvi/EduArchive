import { getStudentProfileTool } from '../tools/studentTools.js';
import { getStudentDocumentsTool, getDocumentDetailsTool, searchDocumentsTool } from '../tools/documentTools.js';
import { getPendingRequestsTool, getVerificationHistoryTool } from '../tools/verificationTools.js';

const TOOL_REGISTRY = {
  getStudentProfileTool,
  getStudentDocumentsTool,
  getDocumentDetailsTool,
  searchDocumentsTool,
  getPendingRequestsTool,
  getVerificationHistoryTool
};

/**
 * Tool Execution Node
 * Executes dynamically selected tools under verified RBAC authorization.
 */
export const toolExecutionNode = async (state) => {
  const caller = {
    userId: state.userId,
    userRole: state.userRole,
    userCollegeId: state.userCollegeId,
    studentId: state.studentId
  };

  const selected = state.selectedTools || [];
  const params = state.toolParameters || {};
  const toolResults = [];
  const steps = [];

  for (const toolName of selected) {
    const fn = TOOL_REGISTRY[toolName];
    if (fn) {
      const toolParam = params[toolName] || {};
      const result = await fn({ caller, ...toolParam });
      toolResults.push({ tool: toolName, result });
      steps.push(`✓ Tool Executed: ${toolName} (${result.success ? 'Success' : 'Failed'})`);
    }
  }

  // Aggregate retrieved records for downstream nodes
  const aggregatedData = {};
  for (const tr of toolResults) {
    if (tr.result && tr.result.success) {
      aggregatedData[tr.tool] = tr.result.data;
    }
  }

  return {
    toolResults,
    retrievedData: aggregatedData,
    steps
  };
};
