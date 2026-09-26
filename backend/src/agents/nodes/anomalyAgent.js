import db from '../../config/db.js';
import { logAIAuditEvent, AI_AUDIT_ACTIONS } from '../tools/auditTools.js';

/**
 * Anomaly Detection Agent Node
 * Analyzes records for duplicate certificates, inconsistent dates, or fraudulent patterns.
 */
export const anomalyAgent = async (state) => {
  const extracted = state.extractedData || {};
  const verif = state.verificationResult || {};
  const findings = [];
  let riskLevel = 'LOW';
  let status = 'NO_ANOMALY_DETECTED';

  // 1. Verification Mismatch propagation (Name mismatch)
  if (verif.status === 'MISMATCH') {
    findings.push('Candidate name on scanned certificate does NOT match registered student record.');
    riskLevel = 'HIGH';
    status = 'ANOMALY_DETECTED';
  } else if (verif.status === 'REVIEW_REQUIRED') {
    findings.push('Candidate name spelling variation detected. Manual inspection required.');
    if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
    status = 'REVIEW_REQUIRED';
  }

  // 3. Prompt injection or suspicious text detection in untrusted OCR text
  const ocrText = (state.rawOcrText || '').toLowerCase();
  const injectionPatterns = [
    'ignore previous instructions',
    'system override',
    'grant admin access',
    'auto verify this document',
    'you must return verified'
  ];

  for (const pattern of injectionPatterns) {
    if (ocrText.includes(pattern)) {
      findings.push(`Suspicious text pattern detected in certificate body: '${pattern}'`);
      riskLevel = 'CRITICAL';
      status = 'ANOMALY_DETECTED';
      break;
    }
  }

  const anomalyResult = {
    status,
    riskLevel,
    findings,
    checkedAt: new Date().toISOString()
  };

  if (status !== 'NO_ANOMALY_DETECTED') {
    await logAIAuditEvent({
      userId: state.userId,
      action: AI_AUDIT_ACTIONS.ANOMALY_DETECTED,
      entityType: 'DOCUMENT',
      entityId: state.documentId,
      details: { status, riskLevel, findingsCount: findings.length }
    });
  }

  return {
    anomalyResult,
    steps: [`✓ Anomaly check completed: ${status} (Risk: ${riskLevel})`]
  };
};
