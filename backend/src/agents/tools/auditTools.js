import { logAudit } from '../../services/auditService.js';

/**
 * AI Audit Logging Tools
 * Standardizes event logging for LangGraph lifecycle actions and security verifications.
 */

export const AI_AUDIT_ACTIONS = {
  STARTED: 'AI_AGENT_STARTED',
  TOOL_EXECUTED: 'AI_TOOL_EXECUTED',
  DOCUMENT_ANALYZED: 'AI_DOCUMENT_ANALYZED',
  VERIFICATION_COMPLETED: 'AI_VERIFICATION_COMPLETED',
  ANOMALY_DETECTED: 'AI_ANOMALY_DETECTED',
  HUMAN_REVIEW_REQUIRED: 'AI_HUMAN_REVIEW_REQUIRED',
  HUMAN_APPROVED: 'AI_HUMAN_APPROVED',
  HUMAN_REJECTED: 'AI_HUMAN_REJECTED',
  FAILED: 'AI_AGENT_FAILED',
  SECURITY_BLOCKED: 'AI_AGENT_SECURITY_VIOLATION_BLOCKED'
};

export const logAIAuditEvent = async ({
  userId,
  action,
  entityType = 'AI_AGENT',
  entityId = null,
  details = {},
  ipAddress = '127.0.0.1'
}) => {
  try {
    // Sanitize details: never store sensitive OCR payloads or hidden chain-of-thought
    const sanitizedDetails = { ...details };
    if (sanitizedDetails.rawText) {
      delete sanitizedDetails.rawText;
    }
    if (sanitizedDetails.token) {
      delete sanitizedDetails.token;
    }

    return await logAudit({
      userId: userId || 'AI_LANGGRAPH_ORCHESTRATOR',
      action,
      entityType,
      entityId,
      details: sanitizedDetails,
      ipAddress
    });
  } catch (error) {
    console.error('[AI Audit Error]: Failed to record AI audit log:', error.message);
  }
};
