import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { AIVerificationModal } from '../../components/AIVerificationModal.jsx';
import { 
  FileCheck2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Info,
  HelpCircle
} from 'lucide-react';

export const StudentVerification = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspectDoc, setSelectedInspectDoc] = useState(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('[StudentVerification] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
          Certificate Verification Status Tracker
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Real-time institutional verification status and automated AI OCR audit records
        </p>
      </div>

      {/* Educational Banner: How Verification Works */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0
        }}>
          <Sparkles size={18} />
        </div>
        <div>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>
            How Verification Works in EduArchive
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Each certificate undergoes automated OCR neural analysis to match student name, roll number, course, and institutional seals against the college database. The issuing college administration provides final cryptographic attestation.
          </p>
        </div>
      </div>

      {/* Certificate Verification Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading verification records...</div>
      ) : documents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No documents available for verification tracking.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Certificate Title</th>
                <th style={{ padding: '14px 18px' }}>Issuing College</th>
                <th style={{ padding: '14px 18px' }}>Current Status</th>
                <th style={{ padding: '14px 18px' }}>AI Match Confidence</th>
                <th style={{ padding: '14px 18px' }}>Verification Date</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>AI Report</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const aiResult = doc.verification?.ai_result;
                const score = aiResult?.confidenceScore ?? (doc.status === 'VERIFIED' ? 98 : 65);

                return (
                  <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#f8fafc' }}>
                      <div>{doc.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.document_type}</div>
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {doc.college?.name}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <StatusBadge status={doc.status} />
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 80,
                          height: 6,
                          borderRadius: 3,
                          background: '#1e293b',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${score}%`,
                            height: '100%',
                            background: score >= 85 ? '#10b981' : (score < 55 ? '#f43f5e' : '#f59e0b'),
                            borderRadius: 3
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: score >= 85 ? '#34d399' : '#fbbf24' }}>
                          {score}%
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {doc.verification?.verified_at ? new Date(doc.verification.verified_at).toLocaleDateString() : 'Pending final sign-off'}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedInspectDoc(doc)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: 6, borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c084fc' }}
                      >
                        <Sparkles size={13} />
                        <span>Inspect AI</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedInspectDoc && (
        <AIVerificationModal
          document={selectedInspectDoc}
          onClose={() => setSelectedInspectDoc(null)}
          onStatusUpdated={fetchDocs}
          isCollegeAdmin={false}
        />
      )}

    </div>
  );
};
