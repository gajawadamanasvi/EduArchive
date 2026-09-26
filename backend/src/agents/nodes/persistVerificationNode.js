import db from '../../config/db.js';
import { logAIAuditEvent, AI_AUDIT_ACTIONS } from '../tools/auditTools.js';

/**
 * Persist Verification Node
 * LangGraph node responsible for committing verified findings and status to the database.
 */
export const persistVerificationNode = async (state) => {
  const docId = state.documentId;
  const verif = state.verificationResult;
  const critic = state.criticResult;
  const requiresHuman = state.requiresHumanReview;

  if (!docId || docId === 'simulation_test') {
    return {
      steps: ['✓ State Persisted: Transient scan simulation completed (no DB record altered)']
    };
  }

  try {
    const doc = db.findById('documents', docId);
    if (!doc) {
      return {
        steps: [`⚠ State Persistence: Target document ID ${docId} not found in database`]
      };
    }

    const verificationStatus = requiresHuman 
      ? 'NEEDS_REVIEW' 
      : (verif?.status === 'VERIFIED' ? 'AI_CONSISTENT' : 'NEEDS_REVIEW');

    const remarks = requiresHuman 
      ? `AI Flagged for Human Review: ${state.humanReviewReason || 'Institutional review required'}`
      : (verif?.recommendation || 'AI Verified and consistent with institutional registry');

    const existingVerif = db.findOne('verification_records', v => String(v.document_id) === String(docId));
    let verifRecord;

    const payload = {
      document_id: doc.id,
      verified_by: state.userId || 'AI_LANGGRAPH_ORCHESTRATOR',
      verification_status: verificationStatus,
      remarks,
      ai_result: {
        verifiedAt: new Date().toISOString(),
        confidenceScore: Math.round((verif?.confidence || 0.8) * 100),
        classification: state.classification || (verif?.status === 'VERIFIED' ? 'CONSISTENT' : 'NEEDS_MANUAL_REVIEW'),
        statusBadge: state.statusBadge || (verif?.status === 'VERIFIED' ? 'CONSISTENT' : 'NEEDS_REVIEW'),
        extractedFields: state.extractedData || {},
        fieldChecks: verif?.fieldChecks || [],
        recommendation: remarks,
        requiresHumanReview: requiresHuman,
        anomalyRisk: state.anomalyResult?.riskLevel || 'LOW',
        criticDecision: critic?.decision || 'APPROVE',
        workflowSteps: state.steps || []
      },
      verified_at: new Date().toISOString()
    };

    if (existingVerif) {
      verifRecord = db.update('verification_records', existingVerif.id, payload);
    } else {
      verifRecord = db.insert('verification_records', payload);
    }

    await logAIAuditEvent({
      userId: state.userId,
      action: requiresHuman ? AI_AUDIT_ACTIONS.HUMAN_REVIEW_REQUIRED : AI_AUDIT_ACTIONS.VERIFICATION_COMPLETED,
      entityType: 'DOCUMENT',
      entityId: docId,
      details: {
        score: Math.round((verif?.confidence || 0.8) * 100),
        status: verificationStatus,
        requiresHumanReview: requiresHuman
      }
    });

    return {
      persistedRecord: verifRecord,
      steps: [`✓ Database Updated: Verification record ${verifRecord.id} saved with status '${verificationStatus}'`]
    };
  } catch (err) {
    console.error('[Persist Verification Node Error]:', err.message);
    return {
      errors: [err.message],
      steps: [`⚠ Database Persistence Warning: ${err.message}`]
    };
  }
};
