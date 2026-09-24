import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { DashboardCard } from '../../components/DashboardCard.jsx';
import { DocumentCard } from '../../components/DocumentCard.jsx';
import { VerificationBadge } from '../../components/VerificationBadge.jsx';
import { AIVerificationModal } from '../../components/AIVerificationModal.jsx';
import { PhysicalIssueModal } from '../../components/PhysicalIssueModal.jsx';
import { 
  Building2, 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Send, 
  FilePlus, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CollegeDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspectDoc, setSelectedInspectDoc] = useState(null);
  const [selectedPhysicalDoc, setSelectedPhysicalDoc] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsRes, docsRes, reqsRes] = await Promise.all([
        api.getCollegeStudents(),
        api.getDocuments(),
        api.getDocumentRequests()
      ]);

      if (studentsRes.success) setStudents(studentsRes.students || []);
      if (docsRes.success) setDocuments(docsRes.documents || []);
      if (reqsRes.success) setRequests(reqsRes.requests || []);
    } catch (err) {
      console.error('[CollegeDashboard] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalStudents = students.length;
  const totalDocs = documents.length;
  const verifiedDocs = documents.filter(d => d.status === 'VERIFIED').length;
  const pendingDocs = documents.filter(d => d.status === 'PENDING' || d.status === 'NEEDS_REVIEW').length;
  const rejectedDocs = documents.filter(d => d.status === 'REJECTED').length;
  const pendingRequests = requests.filter(r => r.request_status === 'PENDING').length;

  const handleDownload = async (doc) => {
    try {
      const blob = await api.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${doc.document_type.replace(/[^a-zA-Z0-9]/g, '_')}_Verified.svg`;
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
      
      {/* College Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(15, 23, 42, 0.8))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Building2 size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                {user?.college?.name || user?.college_name || 'Institution Workspace'}
              </h2>
              {user?.college && (
                <VerificationBadge status={user.college.verification_status} />
              )}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Administrator: <strong style={{ color: '#f8fafc' }}>{user?.name}</strong> • Affiliation: {user?.college?.university || 'State Technical University'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/college/upload" className="btn-primary" style={{ padding: '10px 18px', borderRadius: 10 }}>
            <FilePlus size={16} />
            <span>Upload Certificate</span>
          </Link>
          <Link to="/college/verification" className="btn-secondary" style={{ padding: '10px 16px', borderRadius: 10, borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c084fc' }}>
            <Sparkles size={16} />
            <span>Verification Queue ({pendingDocs})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <DashboardCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="blue"
          subtitle="Registered in college"
        />
        <DashboardCard
          title="Total Documents"
          value={totalDocs}
          icon={FileText}
          color="cyan"
          subtitle="Archived in repository"
        />
        <DashboardCard
          title="Verified"
          value={verifiedDocs}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Authenticated certificates"
        />
        <DashboardCard
          title="Pending / Review"
          value={pendingDocs}
          icon={Clock}
          color="amber"
          subtitle="Needs college sign-off"
        />
        <DashboardCard
          title="Student Requests"
          value={pendingRequests}
          icon={Send}
          color="purple"
          subtitle="Awaiting processing"
        />
      </div>

      {/* Recent Certificates in College Repository */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              Institutional Certificate Registry
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Latest digital student certificates scanned and verified by your institution
            </p>
          </div>

          <Link to="/college/documents" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>
            <span>Manage All Documents ({documents.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No student certificates uploaded yet.</p>
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
                onPhysicalIssue={(d) => setSelectedPhysicalDoc(d)}
                showActions={true}
                isCollegeView={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pending Student Requests */}
      {requests.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              Pending Student Document Requests
            </h3>
            <Link to="/college/requests" style={{ fontSize: '0.82rem', color: '#60a5fa', fontWeight: 600 }}>
              Process Requests
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
                    {req.student?.name} ({req.student?.roll_number}) — {req.document_type}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Reason: {req.reason} • Requested on {new Date(req.request_date).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge ${req.request_status === 'APPROVED' ? 'badge-verified' : 'badge-pending'}`}>
                    {req.request_status}
                  </span>
                  <Link to="/college/requests" className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
                    Process
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedInspectDoc && (
        <AIVerificationModal
          document={selectedInspectDoc}
          onClose={() => setSelectedInspectDoc(null)}
          onStatusUpdated={loadDashboardData}
          isCollegeAdmin={true}
        />
      )}

      {selectedPhysicalDoc && (
        <PhysicalIssueModal
          document={selectedPhysicalDoc}
          onClose={() => setSelectedPhysicalDoc(null)}
          onUpdated={loadDashboardData}
        />
      )}

    </div>
  );
};
