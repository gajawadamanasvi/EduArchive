import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { DashboardCard } from '../../components/DashboardCard.jsx';
import { DocumentCard } from '../../components/DocumentCard.jsx';
import { DocumentRequestModal } from '../../components/DocumentRequestModal.jsx';
import { AIVerificationModal } from '../../components/AIVerificationModal.jsx';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertTriangle, 
  FilePlus, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Building2,
  PackageCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedInspectDoc, setSelectedInspectDoc] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsData, reqsData] = await Promise.all([
        api.getDocuments(),
        api.getDocumentRequests()
      ]);
      if (docsData.success) setDocuments(docsData.documents || []);
      if (reqsData.success) setRequests(reqsData.requests || []);
    } catch (err) {
      console.error('[StudentDashboard] Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalDocs = documents.length;
  const verifiedDocs = documents.filter(d => d.status === 'VERIFIED').length;
  const pendingDocs = documents.filter(d => d.status === 'PENDING' || d.status === 'NEEDS_REVIEW').length;
  const physicalIssuedDocs = documents.filter(d => d.status === 'PHYSICAL_ISSUED').length;
  const totalRequestsCount = requests.length;

  const handleDownload = async (doc) => {
    try {
      const blob = await api.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${doc.document_type.replace(/[^a-zA-Z0-9]/g, '_')}_Official_Verified.svg`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('Failed to download certificate: ' + err.message);
    }
  };

  const handleView = (doc) => {
    window.open(`/api/documents/${doc.id}/view`, '_blank');
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.35), rgba(15, 23, 42, 0.75))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
            alt={user?.name}
            style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #3b82f6', background: '#1e293b' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                Welcome back, {user?.name}!
              </h2>
              <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
                Student Portal
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              <span>Roll: <strong style={{ color: '#f8fafc' }}>{user?.student?.roll_number || 'N/A'}</strong></span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Building2 size={14} className="text-blue-400" />
                {user?.student?.college?.name || user?.college_name || 'Apex Institute of Technology'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="btn-primary"
          style={{ padding: '10px 20px', borderRadius: 10 }}
        >
          <FilePlus size={18} />
          <span>Request Certificate</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <DashboardCard
          title="Total Documents"
          value={totalDocs}
          icon={FileText}
          color="blue"
          subtitle="Registered in repository"
        />
        <DashboardCard
          title="Verified Certificates"
          value={verifiedDocs}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Ready for instant download"
        />
        <DashboardCard
          title="Pending Verification"
          value={pendingDocs}
          icon={Clock}
          color="amber"
          subtitle="Awaiting college attestation"
        />
        <DashboardCard
          title="Physical Issued"
          value={physicalIssuedDocs}
          icon={PackageCheck}
          color="cyan"
          subtitle="Temporarily checked out"
        />
        <DashboardCard
          title="Document Requests"
          value={totalRequestsCount}
          icon={Send}
          color="purple"
          subtitle="Submitted requests"
        />
      </div>

      {/* Recent Documents Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              My Authorized Certificates
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Digitally verified academic certificates issued by your registered institution
            </p>
          </div>

          <Link to="/student/documents" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>
            <span>View All ({documents.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading certificates...</div>
        ) : documents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h4 style={{ marginBottom: 4 }}>No Certificates Found</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>You can submit a request to your college administration to upload digital certificates.</p>
            <button onClick={() => setShowRequestModal(true)} className="btn-primary">
              <FilePlus size={16} />
              <span>Submit Certificate Request</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {documents.slice(0, 4).map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onView={handleView}
                onDownload={handleDownload}
                onInspectAI={(d) => setSelectedInspectDoc(d)}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Requests Section */}
      {requests.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              Recent Document Requests
            </h3>
            <Link to="/student/requests" style={{ fontSize: '0.82rem', color: '#60a5fa', fontWeight: 600 }}>
              Manage Requests
            </Link>
          </div>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            {requests.slice(0, 3).map((req, idx) => (
              <div
                key={req.id}
                style={{
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: idx < requests.length - 1 ? '1px solid var(--border-glass)' : 'none'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                    {req.document_type}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Reason: {req.reason} • Requested on {new Date(req.request_date).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge ${req.request_status === 'APPROVED' ? 'badge-verified' : (req.request_status === 'REJECTED' ? 'badge-rejected' : 'badge-pending')}`}>
                    {req.request_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showRequestModal && (
        <DocumentRequestModal
          onClose={() => setShowRequestModal(false)}
          onRequestCreated={loadData}
        />
      )}

      {selectedInspectDoc && (
        <AIVerificationModal
          document={selectedInspectDoc}
          onClose={() => setSelectedInspectDoc(null)}
          onStatusUpdated={loadData}
          isCollegeAdmin={false}
        />
      )}

    </div>
  );
};
