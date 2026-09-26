/**
 * EduArchive LangGraph Conditional Routers
 * Controls the conditional decisions and state transitions throughout the orchestrator workflow.
 */

export const routeAfterTools = (state) => {
  const intent = state.intent;
  if (
    intent === 'DOCUMENT_VERIFICATION' || 
    intent === 'DOCUMENT_ANALYSIS' || 
    state.rawOcrText || 
    state.documentId
  ) {
    return 'documentAgent';
  }
  return 'retrievalAgent';
};

export const routeFromCritic = (state) => {
  const critic = state.criticResult;
  const retries = state.retryCount || 0;

  // 1. Retry Condition: if critic flagged retry and budget is remaining
  if (critic?.decision === 'RETRY' && retries < 2) {
    return 'documentAgent';
  }

  // 2. Human Review Escalation Condition
  if (state.requiresHumanReview || critic?.decision === 'FLAG_HUMAN_REVIEW') {
    return 'humanReviewNode';
  }

  // 3. Approved / Verified Condition -> Persist in Database
  return 'persistVerificationNode';
};
