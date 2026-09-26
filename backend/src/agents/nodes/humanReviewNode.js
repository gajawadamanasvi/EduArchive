import { logAIAuditEvent, AI_AUDIT_ACTIONS } from '../tools/auditTools.js';

/**
 * Human Review Node
 * Ensures sensitive actions require human approval and are logged to audit records.
 */
export const humanReviewNode = async (state) => {
  await logAIAuditEvent({
    userId: state.userId,
    action: AI_AUDIT_ACTIONS.HUMAN_REVIEW_REQUIRED,
    entityType: 'DOCUMENT',
    entityId: state.documentId,
    details: {
      reason: state.humanReviewReason,
      confidence: state.verificationResult?.confidence,
      anomalyRisk: state.anomalyResult?.riskLevel
    }
  });

  return {
    requiresHumanReview: true,
    steps: [`⚠ Human-in-the-loop: Dispatched to College Administrator review queue`]
  };
};
