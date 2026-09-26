import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { DocumentCard } from '../../components/DocumentCard.jsx';
import { DocumentTable } from '../../components/DocumentTable.jsx';
import { AIVerificationModal } from '../../components/AIVerificationModal.jsx';
import { PhysicalIssueModal } from '../../components/PhysicalIssueModal.jsx';
import { CertificateViewerModal } from '../../components/CertificateViewerModal.jsx';
import { 
  FileText, 
  Search, 
  LayoutGrid, 
  List, 
  FilePlus, 
  Sparkles, 
  PackageCheck,
  Building2,
  Eye,
  Download,
  Folder,
  FolderOpen,
  User,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CollegeDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('folders'); // 'folders', 'grid', 'table'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedStudents, setExpandedStudents] = useState({});
  const [selectedInspectDoc, setSelectedInspectDoc] = useState(null);
  const [selectedPhysicalDoc, setSelectedPhysicalDoc] = useState(null);
  const [selectedViewDoc, setSelectedViewDoc] = useState(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments({
        search,
        status: statusFilter
      });
      if (data.success) {
        const docs = data.documents || [];
        setDocuments(docs);
        // Automatically expand all students initially
        const studentMap = {};
        docs.forEach(d => {
          if (d.student_id) studentMap[d.student_id] = true;
        });
        setExpandedStudents(studentMap);
      }
    } catch (err) {
      console.error('[CollegeDocuments] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocs();
  };

  const toggleStudentExpand = (studentId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await api.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      let ext = '.svg';
      if (blob.type && blob.type.includes('pdf')) ext = '.pdf';
      else if (blob.type && blob.type.includes('png')) ext = '.png';
      else if (blob.type && (blob.type.includes('jpeg') || blob.type.includes('jpg'))) ext = '.jpg';
      const cleanTitle = (doc.document_type || doc.title || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_');
      const roll = doc.student?.roll_number ? `_${doc.student.roll_number}` : '';
      a.download = `${cleanTitle}${roll}_Verified${ext}`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('Failed to download certificate: ' + err.message);
    }
  };

  const handleView = (doc) => {
    setSelectedViewDoc(doc);
  };

  // Group documents by student
  const studentGroups = React.useMemo(() => {
    const groups = {};
    documents.forEach(doc => {
      const sId = doc.student_id || 'unknown';
      if (!groups[sId]) {
        groups[sId] = {
          studentId: sId,
          studentName: doc.student?.name || 'Unknown Student',
          rollNumber: doc.student?.roll_number || 'N/A',
          department: doc.student?.department || doc.student?.course || 'Academic Department',
          email: doc.student?.email || '',
          documents: []
        };
      }
      groups[sId].documents.push(doc);
    });
    return Object.values(groups);
  }, [documents]);

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            College Certificate Repository
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            All academic certificates categorized and organized under each enrolled student's dossier
          </p>
        </div>

        <Link to="/college/upload" className="btn-primary" style={{ padding: '10px 18px' }}>
          <FilePlus size={16} />
          <span>Upload & Verify Certificate</span>
        </Link>
      </div>

      {/* Filter & View Mode Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by student name, roll number, or certificate title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 36 }}
            />
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn-secondary" style={{ padding: '8px 14px' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', paddingRight: 32 }}
          >
            <option value="">All Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="PENDING">Pending Only</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="PHYSICAL_ISSUED">Physical Certificate Issued</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: '#0f172a', padding: 4, borderRadius: 8, border: '1px solid #334155' }}>
            <button
              type="button"
              onClick={() => setViewMode('folders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 600,
                background: viewMode === 'folders' ? '#1e293b' : 'transparent',
                color: viewMode === 'folders' ? '#60a5fa' : 'var(--text-muted)'
              }}
              title="Group by Student Folders"
            >
              <Folder size={15} />
              <span>By Student</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: viewMode === 'grid' ? '#1e293b' : 'transparent',
                color: viewMode === 'grid' ? '#60a5fa' : 'var(--text-muted)'
              }}
              title="All Documents Grid"
            >
              <LayoutGrid size={16} />
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: viewMode === 'table' ? '#1e293b' : 'transparent',
                color: viewMode === 'table' ? '#60a5fa' : 'var(--text-muted)'
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '56px 20px', textAlign: 'center' }}>
          <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: 6, color: '#f8fafc' }}>
            No Certificates Found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Upload a student certificate scan to trigger automated AI OCR verification.
          </p>
          <Link to="/college/upload" className="btn-primary">
            <FilePlus size={16} />
            <span>Upload Certificate</span>
          </Link>
        </div>
      ) : viewMode === 'folders' ? (
        /* Student Dossier / Folder View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {studentGroups.map((group) => {
            const isExpanded = Boolean(expandedStudents[group.studentId]);
            const verifiedCount = group.documents.filter(d => d.status === 'VERIFIED').length;
            const pendingCount = group.documents.filter(d => d.status === 'PENDING' || d.status === 'NEEDS_REVIEW').length;
            const physicalCount = group.documents.filter(d => d.is_physical_issued).length;

            return (
              <div 
                key={group.studentId}
                className="glass-panel"
                style={{ 
                  borderRadius: 14, 
                  border: '1px solid rgba(59, 130, 246, 0.25)', 
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.5))'
                }}
              >
                {/* Student Folder Header */}
                <div 
                  onClick={() => toggleStudentExpand(group.studentId)}
                  style={{ 
                    padding: '16px 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid var(--border-glass)' : 'none'
                  }}
                  className="hover:bg-blue-900/10"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ 
                      width: 42, 
                      height: 42, 
                      borderRadius: 10, 
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}>
                      {isExpanded ? <FolderOpen size={22} /> : <Folder size={22} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                          {group.studentName}
                        </h3>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, background: '#1e293b', color: '#93c5fd', fontWeight: 700 }}>
                          Roll: {group.rollNumber}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {group.department}
                      </div>
                    </div>
                  </div>

                  {/* Summary Badges & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        📄 {group.documents.length} Certificates
                      </span>
                      {verifiedCount > 0 && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          ✅ {verifiedCount} Verified
                        </span>
                      )}
                      {pendingCount > 0 && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                          ⏳ {pendingCount} Pending Review
                        </span>
                      )}
                      {physicalCount > 0 && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                          📦 {physicalCount} Issued
                        </span>
                      )}
                    </div>

                    <Link 
                      to={`/college/upload?studentId=${group.studentId}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        color: '#93c5fd'
                      }}
                      className="hover:bg-blue-600 hover:text-white"
                      title="Add another certificate for this student"
                    >
                      <Plus size={14} />
                      <span>Add Certificate</span>
                    </Link>

                    <div style={{ color: 'var(--text-muted)' }}>
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                  </div>
                </div>

                {/* Certificates Grid under this Student */}
                {isExpanded && (
                  <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {group.documents.map((doc) => (
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
            );
          })}
        </div>
      ) : viewMode === 'grid' ? (
        /* Flat Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {documents.map((doc) => (
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
      ) : (
        /* Table View */
        <DocumentTable
          documents={documents}
          onView={handleView}
          onDownload={handleDownload}
          onInspectAI={(d) => setSelectedInspectDoc(d)}
          onPhysicalIssue={(d) => setSelectedPhysicalDoc(d)}
          isCollegeView={true}
        />
      )}

      {/* Modals */}
      {selectedInspectDoc && (
        <AIVerificationModal
          document={selectedInspectDoc}
          onClose={() => setSelectedInspectDoc(null)}
          onStatusUpdated={fetchDocs}
          isCollegeAdmin={true}
        />
      )}

      {selectedPhysicalDoc && (
        <PhysicalIssueModal
          document={selectedPhysicalDoc}
          onClose={() => setSelectedPhysicalDoc(null)}
          onUpdated={fetchDocs}
        />
      )}

      {selectedViewDoc && (
        <CertificateViewerModal
          document={selectedViewDoc}
          onClose={() => setSelectedViewDoc(null)}
        />
      )}

    </div>
  );
};
