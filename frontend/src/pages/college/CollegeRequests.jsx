import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Send, CheckCircle2, XCircle, PackageCheck, Clock, MessageSquare, X, Check } from 'lucide-react';

export const CollegeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProcessReq, setSelectedProcessReq] = useState(null);
  const [processStatus, setProcessStatus] = useState('APPROVED');
  const [processRemarks, setProcessRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getDocumentRequests();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('[CollegeRequests] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProcessReq) return;
    setUpdating(true);
    try {
      await api.processDocumentRequest(selectedProcessReq.id, processStatus, processRemarks);
      setSelectedProcessReq(null);
      setProcessRemarks('');
      fetchRequests();
    } catch (err) {
      alert('Failed to process request: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
          Student Document Retrieval Requests
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Review, approve, and process official certificate retrieval applications submitted by students
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading student requests...</div>
      ) : requests.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Send size={44} style={{ margin: '0 auto 14px', opacity: 0.4 }} />
          <h4 style={{ color: '#f8fafc', marginBottom: 4 }}>No Pending Document Requests</h4>
          <p style={{ fontSize: '0.85rem' }}>All incoming student certificate retrieval requests have been processed.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Student Info</th>
                <th style={{ padding: '14px 18px' }}>Certificate Requested</th>
                <th style={{ padding: '14px 18px' }}>Reason / Purpose</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px' }}>Date</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {req.student?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Roll: {req.student?.roll_number}
                    </div>
                  </td>

                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#60a5fa' }}>
                    <div>{req.document_type}</div>
                    {req.urgent && (
                      <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>
                        ⚡ URGENT REQUEST
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', maxWidth: 260 }}>
                    <div>{req.reason}</div>
                    {req.remarks && (
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: 4 }}>
                        Remark: {req.remarks}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <StatusBadge status={req.request_status} />
                  </td>

                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(req.request_date).toLocaleDateString()}
                  </td>

                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedProcessReq(req);
                        setProcessStatus(req.request_status === 'PENDING' ? 'APPROVED' : req.request_status);
                        setProcessRemarks(req.remarks || '');
                      }}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: 6 }}
                    >
                      <span>Process</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Process Request Modal */}
      {selectedProcessReq && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 520, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                Process Student Request
              </h3>
              <button onClick={() => setSelectedProcessReq(null)} className="hover:text-white" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', marginBottom: 16, fontSize: '0.84rem' }}>
              <div><strong>Student:</strong> {selectedProcessReq.student?.name} ({selectedProcessReq.student?.roll_number})</div>
              <div><strong>Certificate:</strong> {selectedProcessReq.document_type}</div>
              <div><strong>Reason:</strong> {selectedProcessReq.reason}</div>
            </div>

            <form onSubmit={handleProcessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Action Decision
                </label>
                <select
                  value={processStatus}
                  onChange={(e) => setProcessStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="APPROVED">Approve Request (Digital issuance queued)</option>
                  <option value="ISSUED">Mark as Formally Issued</option>
                  <option value="REJECTED">Reject Request</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Administrative Remark for Student
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Approved by Dean. Digital certificate attested."
                  value={processRemarks}
                  onChange={(e) => setProcessRemarks(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setSelectedProcessReq(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="btn-primary">
                  <Check size={16} />
                  <span>{updating ? 'Saving...' : 'Update Request Status'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
