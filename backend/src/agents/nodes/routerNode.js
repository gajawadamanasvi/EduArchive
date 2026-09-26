import { VALID_INTENTS } from '../graph/state.js';
import { logAIAuditEvent, AI_AUDIT_ACTIONS } from '../tools/auditTools.js';

/**
 * Agent Router Node
 * Inspects user request / message and maps it to a strictly validated predefined intent.
 * Defends against arbitrary AI-generated intent strings.
 */
export const routerNode = async (state) => {
  const query = (state.userRequest || '').trim().toLowerCase();
  let selectedIntent = 'GENERAL_INFORMATION';

  // Explicit OCR / verification payload present
  if (state.rawOcrText || state.documentId) {
    selectedIntent = 'DOCUMENT_VERIFICATION';
  } else if (
    query.includes('verify') || 
    query.includes('verification') || 
    query.includes('check authenticity') || 
    query.includes('scan certificate') ||
    query.includes('mismatch')
  ) {
    selectedIntent = 'DOCUMENT_VERIFICATION';
  } else if (
    query.includes('find my') || 
    query.includes('search') || 
    query.includes('my document') || 
    query.includes('my certificate') || 
    query.includes('see my') || 
    query.includes('view certificate') || 
    query.includes('download') ||
    query.includes('list documents') ||
    query.includes('how many document') ||
    query.includes('my status')
  ) {
    selectedIntent = 'DOCUMENT_SEARCH';
  } else if (
    query.includes('request status') || 
    query.includes('pending request') || 
    query.includes('application status') || 
    query.includes('my request') ||
    query.includes('applied for')
  ) {
    selectedIntent = 'STUDENT_REQUEST_STATUS';
  } else if (
    query.includes('generate') || 
    query.includes('issue certificate') || 
    query.includes('bonafide') || 
    query.includes('provisional') ||
    query.includes('request certificate') ||
    query.includes('request a document')
  ) {
    selectedIntent = 'CERTIFICATE_GENERATION';
  } else if (
    query.includes('analytics') || 
    query.includes('audit log') || 
    query.includes('statistics') || 
    query.includes('system count') ||
    query.includes('colleges count')
  ) {
    selectedIntent = 'ADMIN_ANALYTICS';
  } else if (
    query.includes('extract') || 
    query.includes('analyze document') || 
    query.includes('read fields')
  ) {
    selectedIntent = 'DOCUMENT_ANALYSIS';
  } else {
    selectedIntent = 'GENERAL_INFORMATION';
  }

  // Double check against allowlist
  if (!VALID_INTENTS.includes(selectedIntent)) {
    selectedIntent = 'GENERAL_INFORMATION';
  }

  await logAIAuditEvent({
    userId: state.userId,
    action: AI_AUDIT_ACTIONS.STARTED,
    entityType: 'INTENT_ROUTER',
    entityId: selectedIntent,
    details: { intent: selectedIntent, userRole: state.userRole }
  });

  return {
    intent: selectedIntent,
    steps: [`✓ Request routed to intent: ${selectedIntent}`]
  };
};
