import db from '../../config/db.js';
import { logAIAuditEvent, AI_AUDIT_ACTIONS } from '../tools/auditTools.js';

// Normalization helper for resilient comparison
const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

// Levenshtein distance calculation
const levenshteinDistance = (a, b) => {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[bn][an];
};

const similarityRatio = (s1, s2) => {
  const str1 = normalize(s1);
  const str2 = normalize(s2);
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1.0;
  if (str1.includes(str2) || str2.includes(str1)) {
    const minLen = Math.min(str1.length, str2.length);
    const maxLen = Math.max(str1.length, str2.length);
    if (minLen >= 4 && minLen / maxLen >= 0.7) {
      return Math.max(0.85, minLen / maxLen);
    }
  }

  // Word token matching
  const words1 = (s1 || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const words2 = (s2 || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const set2 = new Set(words2);
  const commonWords = words1.filter(w => set2.has(w));
  if (words1.length > 0 && words2.length > 0 && commonWords.length > 0) {
    const wordRatio = commonWords.length / Math.max(words1.length, words2.length);
    if (wordRatio >= 0.5) return wordRatio;
  }

  // Exact Levenshtein character edit distance
  const dist = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  const sim = 1 - (dist / maxLen);
  return Math.max(0, sim);
};

/**
 * Verification Agent Node
 * Authoritatively cross-references extracted OCR values against database registry.
 */
export const verificationAgent = async (state) => {
  const extracted = state.extractedData || {};
  let student = null;

  if (state.studentId) {
    student = db.getStudentWithDetails(state.studentId);
  } else if (state.userId && state.userRole === 'STUDENT') {
    const studentRec = db.findOne('students', s => String(s.user_id) === String(state.userId));
    if (studentRec) student = db.getStudentWithDetails(studentRec.id);
  }

  // Fallback lookup by extracted roll number if not pre-bound
  if (!student && extracted.rollNumber && extracted.rollNumber !== 'REG-UNKNOWN') {
    const matched = db.findOne('students', s => (s.roll_number || '').toLowerCase() === extracted.rollNumber.toLowerCase());
    if (matched) {
      student = db.getStudentWithDetails(matched.id);
    }
  }

  if (!student) {
    const fallbackResult = {
      status: 'REVIEW_REQUIRED',
      confidence: 0.40,
      mismatches: [{ field: 'Student Identity', reason: 'No registered student record matches this document.' }],
      evidence: [],
      recommendation: 'Student not found in institutional database. Manual verification required.'
    };
    return {
      verificationResult: fallbackResult,
      requiresHumanReview: true,
      humanReviewReason: 'Unregistered student profile',
      steps: ['⚠ Verification: Student identity not registered in official database']
    };
  }

  const college = student.college || (student.college_id ? db.findById('colleges', student.college_id) : null);

  // 1. Cross-verify exclusively by Student Name
  const checks = [];
  const mismatches = [];
  const evidence = [];

  const officialName = student.user?.name || student.name || '';
  const extractedName = extracted.studentName || '';
  const nameSim = similarityRatio(officialName, extractedName);

  let status = 'VERIFIED';
  let classification = 'CONSISTENT';
  let statusBadge = 'CONSISTENT';
  let confidence = 1.0;
  let recommendation = 'Candidate name matches student registry records. Verification approved.';

  if (nameSim >= 0.8) {
    confidence = 0.98;
    status = 'VERIFIED';
    classification = 'CONSISTENT';
    statusBadge = 'CONSISTENT';
    evidence.push(`Student name matches registered record: '${officialName}'`);
    checks.push({ field: 'Student Name', status: 'MATCH', confidence: 0.98 });
    recommendation = 'Candidate name matches student registry records. Certificate verification approved.';
  } else if (nameSim >= 0.45) {
    confidence = Math.round(nameSim * 100) / 100;
    status = 'REVIEW_REQUIRED';
    classification = 'NEEDS_MANUAL_REVIEW';
    statusBadge = 'NEEDS_REVIEW';
    mismatches.push({ field: 'Student Name', reason: `Partial name variance: Official '${officialName}' vs Scanned '${extractedName}'` });
    checks.push({ field: 'Student Name', status: 'PARTIAL_MISMATCH', confidence: nameSim });
    recommendation = `Minor name discrepancy detected: Official '${officialName}' vs Certificate '${extractedName}'. Manual review required.`;
  } else {
    confidence = Math.max(Math.round(nameSim * 100) / 100, 0.15);
    status = 'MISMATCH';
    classification = 'SUSPICIOUS_MISMATCH';
    statusBadge = 'SUSPICIOUS';
    mismatches.push({ field: 'Student Name', reason: `Name Mismatch: Certificate belongs to '${extractedName}' instead of registered student '${officialName}'` });
    checks.push({ field: 'Student Name', status: 'MISMATCH', confidence: nameSim });
    recommendation = `Critical Name Mismatch: Scanned certificate belongs to '${extractedName}' instead of registered student '${officialName}'.`;
  }

  const verificationResult = {
    status,
    confidence,
    mismatches,
    evidence,
    fieldChecks: checks,
    recommendation
  };

  await logAIAuditEvent({
    userId: state.userId,
    action: AI_AUDIT_ACTIONS.VERIFICATION_COMPLETED,
    entityType: 'DOCUMENT',
    entityId: state.documentId,
    details: { status, confidence, mismatchCount: mismatches.length }
  });

  return {
    verificationResult,
    classification,
    statusBadge,
    steps: [`✓ Verification completed: Status ${status} (Confidence: ${Math.round(confidence * 100)}%)`]
  };
};
