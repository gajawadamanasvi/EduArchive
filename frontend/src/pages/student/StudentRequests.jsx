import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { DocumentRequestModal } from '../../components/DocumentRequestModal.jsx';
import { Send, FilePlus, Clock, CheckCircle2, XCircle, PackageCheck, AlertCircle } from 'lucide-react';

export const StudentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getDocumentRequests();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('[StudentRequests] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-verified"><CheckCircle2 size={13} /> Approved</span>;
      case 'ISSUED':
        return <span className="badge badge-issued"><PackageCheck size={13} /> Issued</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected"><XCircle size={13} /> Rejected</span>;
      default:
        return <span className="badge badge-pending"><Clock size={13} /> Pending Review</span>;
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            Document Retrieval Requests
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Track requests submitted to your college administration for certificate issuance
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{ padding: '10px 18px' }}
        >
          <FilePlus size={16} />
          <span>New Document Request</span>
        </button>
      </div>

      {/* Requests Table / List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Send size={44} style={{ margin: '0 auto 14px', opacity: 0.4 }} />
          <h4 style={{ marginBottom: 6, color: '#f8fafc' }}>No Document Requests Found</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 18 }}>
            Need an official degree certificate, transcript, or transfer certificate? Submit a request now.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <FilePlus size={16} />
            <span>Create First Request</span>
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Certificate Requested</th>
                <th style={{ padding: '14px 18px' }}>Purpose / Reason</th>
                <th style={{ padding: '14px 18px' }}>Priority</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px' }}>Submitted Date</th>
                <th style={{ padding: '14px 18px' }}>College Admin Remark</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#f8fafc' }}>
                    {req.document_type}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', maxWidth: 280 }}>
                    {req.reason}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {req.urgent ? (
                      <span style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                        URGENT
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Standard</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {getStatusBadge(req.request_status)}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(req.request_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 18px', color: req.remarks ? '#60a5fa' : 'var(--text-muted)', fontSize: '0.84rem' }}>
                    {req.remarks || 'Awaiting administrative review'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <DocumentRequestModal
          onClose={() => setShowModal(false)}
          onRequestCreated={fetchRequests}
        />
      )}

    </div>
  );
};
