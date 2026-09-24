import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { DocumentCard } from '../../components/DocumentCard.jsx';
import { DocumentTable } from '../../components/DocumentTable.jsx';
import { DocumentRequestModal } from '../../components/DocumentRequestModal.jsx';
import { AIVerificationModal } from '../../components/AIVerificationModal.jsx';
import { 
  FileText, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  FilePlus, 
  Sparkles, 
  Download 
} from 'lucide-react';

export const StudentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedInspectDoc, setSelectedInspectDoc] = useState(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments({
        search,
        status: statusFilter,
        type: typeFilter
      });
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('[StudentDocuments] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocs();
  };

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
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            My Authorized Academic Documents
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Digitally authenticated certificates issued by your registered institution
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="btn-primary"
          style={{ padding: '10px 18px' }}
        >
          <FilePlus size={16} />
          <span>Request Certificate</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by certificate title or type..."
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

        {/* Dropdowns & View toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', paddingRight: 32 }}
          >
            <option value="">All Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="PENDING">Pending Only</option>
            <option value="PHYSICAL_ISSUED">Physical Issued</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', paddingRight: 32 }}
          >
            <option value="">All Certificate Types</option>
            <option value="Degree Certificate">Degree Certificate</option>
            <option value="10th Certificate">10th Certificate</option>
            <option value="12th Certificate">12th Certificate</option>
            <option value="Marksheet">Marksheet / Transcript</option>
            <option value="Transfer Certificate">Transfer Certificate</option>
          </select>

          {/* Grid / Table Mode Switcher */}
          <div style={{ display: 'flex', background: '#0f172a', padding: 4, borderRadius: 8, border: '1px solid #334155' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: viewMode === 'grid' ? '#1e293b' : 'transparent',
                color: viewMode === 'grid' ? '#3b82f6' : 'var(--text-muted)'
              }}
              title="Grid View"
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
                color: viewMode === 'table' ? '#3b82f6' : 'var(--text-muted)'
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

        </div>

      </div>

      {/* Content Rendering */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading document repository...
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '56px 20px', textAlign: 'center' }}>
          <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: 6, color: '#f8fafc' }}>
            No Certificates Match Your Filters
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Try resetting your search filters or request a new certificate directly from your college administration.
          </p>
          <button onClick={() => setShowRequestModal(true)} className="btn-primary">
            <FilePlus size={16} />
            <span>Request Certificate</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {documents.map((doc) => (
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
      ) : (
        <DocumentTable
          documents={documents}
          onView={handleView}
          onDownload={handleDownload}
          onInspectAI={(d) => setSelectedInspectDoc(d)}
          isCollegeView={false}
        />
      )}

      {/* Modals */}
      {showRequestModal && (
        <DocumentRequestModal
          onClose={() => setShowRequestModal(false)}
          onRequestCreated={fetchDocs}
        />
      )}

      {selectedInspectDoc && (
        <AIVerificationModal
          document={selectedInspectDoc}
          onClose={() => setSelectedInspectDoc(null)}
          onStatusUpdated={fetchDocs}
          isCollegeAdmin={false}
        />
      )}

    </div>
  );
};
