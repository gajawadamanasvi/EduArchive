import { logAIAuditEvent, AI_AUDIT_ACTIONS } from '../tools/auditTools.js';

/**
 * Critic / Validator Node
 * Inspects all findings for evidence sufficiency, validates constraints, prevents infinite loops.
 */
export const criticAgent = async (state) => {
  const verif = state.verificationResult;
  const anomaly = state.anomalyResult;
  const retries = state.retryCount || 0;
  const MAX_RETRIES = 2;

  let isValid = true;
  let decision = 'APPROVE';
  let reason = 'All cross-verification criteria validated successfully.';
  let requiresHumanReview = false;
  let humanReviewReason = null;

  // 1. Missing or incomplete verification data check
  if (!verif) {
    if (retries < MAX_RETRIES) {
      return {
        retryCount: retries + 1,
        criticResult: { isValid: false, decision: 'RETRY', reason: 'Missing verification result payload.' },
        steps: [`↻ Critic requested retry (${retries + 1}/${MAX_RETRIES})`]
      };
    } else {
      isValid = false;
      decision = 'FLAG_HUMAN_REVIEW';
      requiresHumanReview = true;
      humanReviewReason = 'Max retry limit reached without complete verification payload.';
    }
  }

  // 2. Anomaly evaluation
  if (anomaly && (anomaly.riskLevel === 'HIGH' || anomaly.riskLevel === 'CRITICAL' || anomaly.status === 'ANOMALY_DETECTED')) {
    decision = 'FLAG_HUMAN_REVIEW';
    requiresHumanReview = true;
    humanReviewReason = `Anomaly detected with risk level ${anomaly.riskLevel}.`;
  } else if (verif && (verif.status === 'MISMATCH' || verif.status === 'REVIEW_REQUIRED')) {
    decision = 'FLAG_HUMAN_REVIEW';
    requiresHumanReview = true;
    humanReviewReason = `Verification status '${verif.status}' requires institutional officer sign-off.`;
  }

  const criticResult = {
    isValid,
    decision,
    reason: humanReviewReason || reason,
    evaluatedAt: new Date().toISOString()
  };

  let finalResponse = state.finalResponse;
  let actions = state.actions || [];

  if (verif) {
    if (requiresHumanReview) {
      finalResponse = `**Verification Analysis Completed (Review Required)**\n- Status: ⚠️ **${verif.status}**\n- Confidence Score: **${Math.round(verif.confidence * 100)}%**\n- Findings: ${humanReviewReason}\n- Recommendation: ${verif.recommendation}`;
      actions = [
        { label: "View in Verification Queue", route: "/college/verification", variant: "primary" }
      ];
    } else {
      finalResponse = `**Verification Successful**\n- Status: ✅ **${verif.status}**\n- Confidence Score: **${Math.round(verif.confidence * 100)}%**\n- Evidence: All certificate attributes match official student records.`;
      actions = [
        { label: "View Documents", route: "/student/documents", variant: "primary" }
      ];
    }
  }

  return {
    criticResult,
    requiresHumanReview,
    humanReviewReason,
    finalResponse,
    actions,
    steps: [
      requiresHumanReview 
        ? `⚠ Critic: Human review required (${humanReviewReason})` 
        : `✓ Critic: Validation passed with decision ${decision}`
    ]
  };
};
