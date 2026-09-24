import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  FileText, 
  Layers, 
  HelpCircle,
  Check,
  Send
} from 'lucide-react';
import { api } from '../services/api.js';

export const AIVerificationModal = ({ 
  document, 
  aiResult: initialAiResult = null, 
  onClose, 
  onStatusUpdated,
  isCollegeAdmin = false 
}) => {
  const [aiResult, setAiResult] = useState(initialAiResult || document?.verification?.ai_result || null);
  const [scanning, setScanning] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState(null);

  const handleRunScan = async () => {
    if (!document) return;
    setScanning(true);
    setError(null);
    try {
      const data = await api.runAIScan(document.id);
      if (data.success && data.aiResult) {
        setAiResult(data.aiResult);
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err) {
      setError(err.message || 'Failed to execute AI OCR scan.');
    } finally {
      setScanning(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!document) return;
    setUpdating(true);
    setError(null);
    try {
      const data = await api.updateVerificationStatus(document.id, status, remarks || aiResult?.recommendation);
      if (data.success) {
        if (onStatusUpdated) onStatusUpdated();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update certificate status.');
    } finally {
      setUpdating(false);
    }
  };

  if (!document) return null;

  const score = aiResult?.confidenceScore ?? 0;
  const classification = aiResult?.classification || 'PENDING_SCAN';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: 820,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, rgba(139, 92, 246, 0.1), transparent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                AI Document Verification Inspector
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {document.title} • {document.student?.name} ({document.student?.roll_number})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ padding: 6, borderRadius: 6, color: 'var(--text-muted)' }}
            className="hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {!aiResult ? (
            <div style={{ textAlign: 'center', padding: '36px 12px' }}>
              <Sparkles size={44} className="text-purple-400" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: 6 }}>No AI Scan Recorded Yet</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto 18px' }}>
                Execute the AI Verification Agent to extract OCR certificate entities and cross-reference against authorized institutional registry records.
              </p>
              <button
                onClick={handleRunScan}
                disabled={scanning}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', padding: '10px 22px' }}
              >
                <Sparkles size={16} />
                <span>{scanning ? 'Running AI OCR Scan...' : 'Run AI Verification Scan Now'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Score & Classification Banner */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                padding: '16px',
                borderRadius: 12,
                background: classification === 'CONSISTENT'
                  ? 'rgba(16, 185, 129, 0.08)'
                  : (classification === 'SUSPICIOUS_MISMATCH' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)'),
                border: classification === 'CONSISTENT'
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : (classification === 'SUSPICIOUS_MISMATCH' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)')
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    AI Confidence Score
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                      {score}%
                    </span>
                    <span style={{ fontSize: '0.82rem', color: score >= 85 ? '#34d399' : (score < 55 ? '#fb7185' : '#fbbf24'), fontWeight: 600 }}>
                      {score >= 85 ? 'High Confidence' : (score < 55 ? 'Severe Discrepancy' : 'Moderate Match')}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Verification Verdict
                  </span>
                  <div style={{ marginTop: 6 }}>
                    {classification === 'CONSISTENT' && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 700, fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} />
                        <span>🟢 Consistent Record</span>
                      </div>
                    )}
                    {classification === 'NEEDS_MANUAL_REVIEW' && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>
                        <AlertTriangle size={16} />
                        <span>🟡 Needs Manual Review</span>
                      </div>
                    )}
                    {classification === 'SUSPICIOUS_MISMATCH' && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', fontWeight: 700, fontSize: '0.9rem' }}>
                        <ShieldAlert size={16} />
                        <span>🔴 Suspicious / Mismatch</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Entity Cross-Check Table */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={16} className="text-purple-400" />
                  <span>Entity Cross-Verification Breakdown</span>
                </h4>

                <div className="glass-panel" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px 14px' }}>Field Attribute</th>
                        <th style={{ padding: '10px 14px' }}>Official Registry</th>
                        <th style={{ padding: '10px 14px' }}>Extracted OCR</th>
                        <th style={{ padding: '10px 14px' }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiResult.fieldChecks?.map((check, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {check.field}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                            {check.official}
                          </td>
                          <td style={{ padding: '10px 14px', color: check.status === 'MATCH' ? '#34d399' : (check.status === 'MISMATCH' ? '#fb7185' : '#fbbf24') }}>
                            {check.extracted}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: check.status === 'MATCH' ? 'rgba(16,185,129,0.15)' : (check.status === 'MISMATCH' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)'),
                              color: check.status === 'MATCH' ? '#34d399' : (check.status === 'MISMATCH' ? '#fb7185' : '#fbbf24')
                            }}>
                              {check.status} ({check.confidence}%)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendation Note */}
              <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', fontSize: '0.84rem' }}>
                <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: 4 }}>
                  AI Analysis Recommendation:
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {aiResult.recommendation}
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: '2px solid #64748b', paddingLeft: 10 }}>
                {aiResult.disclaimer}
              </div>

              {/* Re-run Scan button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleRunScan}
                  disabled={scanning}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Sparkles size={14} className="text-purple-400" />
                  <span>{scanning ? 'Scanning...' : 'Re-run AI OCR Scan'}</span>
                </button>
              </div>
            </>
          )}

          {/* Admin Verification Decision Actions */}
          {isCollegeAdmin && (
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 18 }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 10, color: '#f8fafc' }}>
                Institutional Verification Action
              </h4>

              <div style={{ marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="Optional administrative verification remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleUpdateStatus('VERIFIED')}
                  disabled={updating}
                  className="btn-emerald"
                  style={{ flex: 1, padding: '10px' }}
                >
                  <Check size={16} />
                  <span>{updating ? 'Updating...' : 'Approve & Verify Certificate'}</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('NEEDS_REVIEW')}
                  disabled={updating}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', borderColor: '#f59e0b', color: '#fbbf24' }}
                >
                  <AlertTriangle size={16} />
                  <span>Flag for Manual Review</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={updating}
                  className="btn-danger"
                  style={{ padding: '10px 18px' }}
                >
                  <XCircle size={16} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
