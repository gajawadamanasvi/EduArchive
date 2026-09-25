import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { DocumentRequestModal } from '../../components/DocumentRequestModal.jsx';
import { CertificateViewerModal } from '../../components/CertificateViewerModal.jsx';
import { 
  Send, 
  FilePlus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PackageCheck, 
  AlertCircle,
  Eye,
  Download,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const StudentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedViewDoc, setSelectedViewDoc] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

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

  const handleViewCertificate = (req) => {
    // If request has enriched document object, use it; otherwise craft a fallback viewable object
    const docToView = req.document || {
      id: req.document_id,
      document_id: req.document_id,
      title: `${req.document_type} - ${req.student?.name || 'Student'}`,
      document_type: req.document_type,
      status: req.request_status === 'ISSUED' ? 'PHYSICAL_ISSUED' : 'VERIFIED',
      student: req.student,
      college: req.college
    };
    setSelectedViewDoc(docToView);
  };

  const handleDownloadCertificate = async (req) => {
    const docId = req.document?.id || req.document_id;
    if (!docId) {
      alert('Document ID is not yet linked. Please refresh or contact admin.');
      return;
    }

    try {
      setDownloadingId(req.id);
      const blob = await api.downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      
      let ext = '.svg';
      if (blob.type && blob.type.includes('pdf')) ext = '.pdf';
      else if (blob.type && blob.type.includes('png')) ext = '.png';
      else if (blob.type && (blob.type.includes('jpeg') || blob.type.includes('jpg'))) ext = '.jpg';
      
      const cleanTitle = (req.document_type || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_');
      const roll = req.student?.roll_number ? `_${req.student.roll_number}` : '';
      a.download = `${cleanTitle}${roll}_Official${ext}`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('Failed to download certificate: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const approvedCount = requests.filter(r => r.request_status === 'APPROVED' || r.request_status === 'ISSUED').length;

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            Document Retrieval Requests
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Track requests submitted to your college administration and download approved certificates
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

      {/* Approved Documents Notification Banner */}
      {approvedCount > 0 && (
        <div className="glass-panel" style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>
                {approvedCount} Document Request{approvedCount > 1 ? 's' : ''} Approved by College Admin
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Your requested certificates have been verified and are ready to view or download below.
              </p>
            </div>
          </div>
        </div>
      )}

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
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>Official Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const isApprovedOrIssued = req.request_status === 'APPROVED' || req.request_status === 'ISSUED';
                const hasDoc = Boolean(req.document || req.document_id);

                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isApprovedOrIssued ? (
                          <ShieldCheck size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                        ) : (
                          <Clock size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        )}
                        <span>{req.document_type}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', maxWidth: 220 }}>
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

                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      {isApprovedOrIssued && hasDoc ? (
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            onClick={() => handleViewCertificate(req)}
                            className="btn-secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              borderRadius: 6,
                              borderColor: 'rgba(59, 130, 246, 0.4)',
                              color: '#60a5fa'
                            }}
                            title="View official digital certificate"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleDownloadCertificate(req)}
                            disabled={downloadingId === req.id}
                            className="btn-primary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              borderRadius: 6
                            }}
                            title="Download verified certificate file"
                          >
                            <Download size={14} />
                            <span>{downloadingId === req.id ? '...' : 'Download'}</span>
                          </button>
                        </div>
                      ) : req.request_status === 'REJECTED' ? (
                        <span style={{ fontSize: '0.76rem', color: '#f87171' }}>
                          Request Declined
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          Pending Approval
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Request Modal */}
      {showModal && (
        <DocumentRequestModal
          onClose={() => setShowModal(false)}
          onRequestCreated={fetchRequests}
        />
      )}

      {/* Certificate Viewer / Download Modal */}
      {selectedViewDoc && (
        <CertificateViewerModal
          document={selectedViewDoc}
          onClose={() => setSelectedViewDoc(null)}
        />
      )}

    </div>
  );
};
