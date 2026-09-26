import { Annotation } from '@langchain/langgraph';

/**
 * EduArchive Agent State Definition
 * Represents the typed workflow context passing through the LangGraph pipeline.
 * Contains only authorized, necessary operational data with strict security boundaries.
 */
export const AgentState = Annotation.Root({
  // Identity and Context
  userId: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
  userRole: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => 'ANONYMOUS' }),
  userCollegeId: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
  userName: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
  sessionId: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),

  // Target Entities & Identifiers
  studentId: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
  documentId: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
  collegeId: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
  filePath: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
  fileName: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
  documentType: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => 'Degree Certificate' }),

  // Input Data
  userRequest: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => '' }),
  rawOcrText: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),

  // Intent Routing (Validated Enumeration)
  intent: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => 'GENERAL_INFORMATION' }),

  // Dynamic Tool Selection and Execution
  selectedTools: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => [] }),
  toolParameters: Annotation({ reducer: (x, y) => ({ ...(x || {}), ...(y || {}) }), default: () => ({}) }),
  toolResults: Annotation({ reducer: (x, y) => (x || []).concat(y || []), default: () => [] }),
  retrievedData: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),

  // Agent Findings & Evidence
  extractedData: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
  verificationResult: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
  anomalyResult: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
  criticResult: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),

  // Classification & Badges
  classification: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => 'CONSISTENT' }),
  statusBadge: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => 'CONSISTENT' }),

  // Human-in-the-loop Escalation
  requiresHumanReview: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => false }),
  humanReviewReason: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),

  // Persistence Record
  persistedRecord: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),

  // Execution Tracing & Safe UI Status
  steps: Annotation({ reducer: (x, y) => (x || []).concat(y || []), default: () => [] }),
  errors: Annotation({ reducer: (x, y) => (x || []).concat(y || []), default: () => [] }),
  retryCount: Annotation({ reducer: (x, y) => (y !== undefined ? y : (x || 0) + 1), default: () => 0 }),

  // Deliverable outputs
  actions: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => [] }),
  finalResponse: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null })
});

export const VALID_INTENTS = [
  'DOCUMENT_SEARCH',
  'DOCUMENT_VERIFICATION',
  'DOCUMENT_ANALYSIS',
  'STUDENT_REQUEST_STATUS',
  'CERTIFICATE_GENERATION',
  'ADMIN_ANALYTICS',
  'GENERAL_INFORMATION'
];
