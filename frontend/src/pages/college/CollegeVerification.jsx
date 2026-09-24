import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { AIVerificationModal } from '../../components/AIVerificationModal.jsx';
import { 
  FileCheck2, 
  Sparkles, 
  Check, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Search,
  Filter
} from 'lucide-react';

export const CollegeVerification = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspectDoc, setSelectedInspectDoc] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PENDING', 'NEEDS_REVIEW', 'SUSPICIOUS', 'VERIFIED'

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('[CollegeVerification] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleQuickApprove = async (docId) => {
    try {
      await api.updateVerificationStatus(docId, 'VERIFIED', 'Officially verified and approved by College Administration.');
      fetchQueue();
    } catch (err) {
      alert('Failed to approve certificate: ' + err.message);
    }
  };

  const handleQuickReject = async (docId) => {
    const remark = prompt('Please enter the administrative reason for rejection:');
    if (!remark) return;
    try {
      await api.updateVerificationStatus(docId, 'REJECTED', remark);
      fetchQueue();
    } catch (err) {
      alert('Failed to reject certificate: ' + err.message);
    }
  };

  const filteredDocs = documents.filter(doc => {
    if (filter === 'PENDING') return doc.status === 'PENDING';
    if (filter === 'NEEDS_REVIEW') return doc.status === 'NEEDS_REVIEW';
    if (filter === 'VERIFIED') return doc.status === 'VERIFIED';
    if (filter === 'SUSPICIOUS') return doc.verification?.ai_result?.classification === 'SUSPICIOUS_MISMATCH';
    return true;
  });

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
          Verification Queue & AI Anomaly Monitor
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Review certificates pending formal verification, inspect AI OCR cross-checks, and attest official records
        </p>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: `All Certificates (${documents.length})` },
          { key: 'PENDING', label: `Pending (${documents.filter(d => d.status === 'PENDING').length})` },
          { key: 'NEEDS_REVIEW', label: `Needs Review (${documents.filter(d => d.status === 'NEEDS_REVIEW').length})` },
          { key: 'SUSPICIOUS', label: `Flagged Suspicious (${documents.filter(d => d.verification?.ai_result?.classification === 'SUSPICIOUS_MISMATCH').length})` },
          { key: 'VERIFIED', label: `Verified (${documents.filter(d => d.status === 'VERIFIED').length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              background: filter === tab.key ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#1e293b',
              color: filter === tab.key ? '#ffffff' : 'var(--text-secondary)',
              border: filter === tab.key ? '1px solid #60a5fa' : '1px solid #334155'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading verification queue...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No certificates in this verification category.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Certificate & Student</th>
                <th style={{ padding: '14px 18px' }}>Current Status</th>
                <th style={{ padding: '14px 18px' }}>AI Match Confidence</th>
                <th style={{ padding: '14px 18px' }}>AI Verdict</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Institutional Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => {
                const aiResult = doc.verification?.ai_result;
                const score = aiResult?.confidenceScore ?? (doc.status === 'VERIFIED' ? 98 : 70);
                const classification = aiResult?.classification || (doc.status === 'VERIFIED' ? 'CONSISTENT' : 'NEEDS_MANUAL_REVIEW');

                return (
                  <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {doc.student?.name} • Roll: {doc.student?.roll_number}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <StatusBadge status={doc.status} />
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 70,
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

                    <td style={{ padding: '14px 18px' }}>
                      {classification === 'CONSISTENT' && (
                        <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 700 }}>🟢 Consistent</span>
                      )}
                      {classification === 'NEEDS_MANUAL_REVIEW' && (
                        <span style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700 }}>🟡 Needs Review</span>
                      )}
                      {classification === 'SUSPICIOUS_MISMATCH' && (
                        <span style={{ fontSize: '0.74rem', color: '#fb7185', fontWeight: 700 }}>🔴 Suspicious</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => setSelectedInspectDoc(doc)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: 6, borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c084fc' }}
                          title="Open AI Inspector & Cross-Verification Breakdown"
                        >
                          <Sparkles size={13} />
                          <span>Inspect AI</span>
                        </button>

                        {doc.status !== 'VERIFIED' && (
                          <button
                            onClick={() => handleQuickApprove(doc.id)}
                            className="btn-emerald"
                            style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: 6 }}
                            title="Approve and issue verified digital certificate"
                          >
                            <Check size={13} />
                            <span>Verify</span>
                          </button>
                        )}

                        {doc.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleQuickReject(doc.id)}
                            className="btn-danger"
                            style={{ padding: '6px 10px', fontSize: '0.78rem', borderRadius: 6 }}
                            title="Reject certificate"
                          >
                            <XCircle size={13} />
                          </button>
                        )}
                      </div>
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
          onStatusUpdated={fetchQueue}
          isCollegeAdmin={true}
        />
      )}

    </div>
  );
};
