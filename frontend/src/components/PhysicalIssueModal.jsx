import React, { useState } from 'react';
import { X, PackageCheck, RotateCcw, Send, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

export const PhysicalIssueModal = ({ document, onClose, onUpdated }) => {
  const isCurrentlyIssued = document?.status === 'PHYSICAL_ISSUED';

  const [actionType, setActionType] = useState(isCurrentlyIssued ? 'RETURN' : 'ISSUE');
  const [issuedTo, setIssuedTo] = useState(document?.student?.name || 'Student');
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnExpectedDate, setReturnExpectedDate] = useState('');
  const [remark, setRemark] = useState(
    isCurrentlyIssued 
      ? 'Physical certificate safely returned to college archive.'
      : 'Certificate temporarily issued to student upon verified request.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.recordPhysicalIssue(document.id, {
        action_type: actionType,
        issued_to: issuedTo,
        issued_date: issuedDate,
        return_expected_date: returnExpectedDate,
        remark
      });
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update physical certificate tracking record.');
    } finally {
      setLoading(false);
    }
  };

  if (!document) return null;

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
        maxWidth: 540,
        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        border: '1px solid rgba(6, 182, 212, 0.4)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, rgba(6, 182, 212, 0.1), transparent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <PackageCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Physical Certificate Tracker
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {document.title}
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

          {/* Action toggle */}
          <div style={{ display: 'flex', gap: 10, background: '#0f172a', padding: 4, borderRadius: 10 }}>
            <button
              type="button"
              onClick={() => {
                setActionType('ISSUE');
                setRemark('Certificate temporarily issued to student upon verified request.');
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: '0.84rem',
                fontWeight: 600,
                background: actionType === 'ISSUE' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'transparent',
                color: actionType === 'ISSUE' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              Issue Physical Copy
            </button>
            <button
              type="button"
              onClick={() => {
                setActionType('RETURN');
                setRemark('Physical certificate safely returned to college archive.');
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: '0.84rem',
                fontWeight: 600,
                background: actionType === 'RETURN' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                color: actionType === 'RETURN' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              Mark as Returned
            </button>
          </div>

          {actionType === 'ISSUE' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Issued To (Recipient Name)
                </label>
                <input
                  type="text"
                  required
                  value={issuedTo}
                  onChange={(e) => setIssuedTo(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Issuance Date
                  </label>
                  <input
                    type="date"
                    required
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Expected Return Date
                  </label>
                  <input
                    type="date"
                    value={returnExpectedDate}
                    onChange={(e) => setReturnExpectedDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Administrative Remark / Purpose
            </label>
            <textarea
              rows={3}
              required
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="input-field"
              placeholder="e.g. Issued for visa appointment / police verification..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ background: actionType === 'ISSUE' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <Send size={16} />
              <span>{loading ? 'Saving...' : (actionType === 'ISSUE' ? 'Record Issuance' : 'Record Return')}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
