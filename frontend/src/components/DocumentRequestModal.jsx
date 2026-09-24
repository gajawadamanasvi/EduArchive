import React, { useState } from 'react';
import { X, Send, FilePlus, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';

export const DocumentRequestModal = ({ onClose, onRequestCreated }) => {
  const [docType, setDocType] = useState('Degree Certificate');
  const [customType, setCustomType] = useState('');
  const [reason, setReason] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const documentTypes = [
    'Degree Certificate',
    '10th Certificate',
    '12th Certificate / Intermediate',
    'Consolidated Marksheet / Transcript',
    'Transfer / Migration Certificate',
    'Provisional Certificate',
    'Bonafide / Character Certificate',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalType = docType === 'Other' ? customType : docType;
    if (!finalType) {
      setError('Please specify the certificate type requested.');
      setLoading(false);
      return;
    }

    try {
      await api.createDocumentRequest({
        document_type: finalType,
        reason,
        urgent
      });
      if (onRequestCreated) onRequestCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit document request.');
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: 520,
        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <FilePlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Request Certificate / Document
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Official institutional retrieval request
              </div>
            </div>
          </div>

          <button onClick={onClose} className="hover:text-white" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Select Certificate Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="input-field"
            >
              {documentTypes.map((t) => (
                <option key={t} value={t} style={{ background: '#0f172a' }}>{t}</option>
              ))}
            </select>
          </div>

          {docType === 'Other' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Specify Certificate Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Medium of Instruction Certificate"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Purpose / Reason for Retrieval
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Required for Higher Education application / Employment background verification..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
            <input
              type="checkbox"
              id="urgentCheck"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#3b82f6', cursor: 'pointer' }}
            />
            <label htmlFor="urgentCheck" style={{ fontSize: '0.82rem', color: '#f8fafc', cursor: 'pointer', fontWeight: 500 }}>
              Mark as <span style={{ color: '#fbbf24', fontWeight: 700 }}>Urgent Requirement</span> (Express Processing)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Send size={16} />
              <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
