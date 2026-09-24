import React from 'react';
import { StatusBadge } from './StatusBadge.jsx';
import { 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  Building2, 
  User, 
  PackageCheck,
  MoreHorizontal
} from 'lucide-react';

export const DocumentTable = ({
  documents = [],
  onView,
  onDownload,
  onInspectAI,
  onPhysicalIssue,
  isCollegeView = false
}) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
        <h4 style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>No documents found</h4>
        <p style={{ fontSize: '0.85rem' }}>No certificates match the selected filters or query.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <th style={{ padding: '14px 18px' }}>Certificate</th>
            {isCollegeView && <th style={{ padding: '14px 18px' }}>Student</th>}
            <th style={{ padding: '14px 18px' }}>Institution</th>
            <th style={{ padding: '14px 18px' }}>Status</th>
            <th style={{ padding: '14px 18px' }}>Uploaded</th>
            <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s ease' }}
              className="hover:bg-slate-800/30"
            >
              {/* Document Title & Type */}
              <td style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                    flexShrink: 0
                  }}>
                    <FileText size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {doc.document_type}
                    </div>
                  </div>
                </div>
              </td>

              {/* Student info (College view) */}
              {isCollegeView && (
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {doc.student?.name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {doc.student?.roll_number}
                  </div>
                </td>
              )}

              {/* Institution */}
              <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{doc.college?.name || 'N/A'}</span>
                  {doc.college?.verification_status === 'VERIFIED' && (
                    <span style={{ color: '#60a5fa', fontWeight: 800 }} title="Verified Institution">✓</span>
                  )}
                </div>
              </td>

              {/* Status Badge */}
              <td style={{ padding: '14px 18px' }}>
                <StatusBadge status={doc.status} isOriginal={doc.is_original} />
              </td>

              {/* Upload Date */}
              <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {new Date(doc.upload_date).toLocaleDateString()}
              </td>

              {/* Action Buttons */}
              <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => onView(doc)}
                    className="btn-secondary"
                    style={{ padding: '5px 10px', fontSize: '0.78rem', borderRadius: 6 }}
                    title="View Certificate"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => onDownload(doc)}
                    className="btn-primary"
                    style={{ padding: '5px 10px', fontSize: '0.78rem', borderRadius: 6 }}
                    title="Download Certificate"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>

                  {onInspectAI && (
                    <button
                      onClick={() => onInspectAI(doc)}
                      className="btn-secondary"
                      style={{ padding: '5px 8px', fontSize: '0.78rem', borderRadius: 6, borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c084fc' }}
                      title="AI OCR Verification Scan Inspector"
                    >
                      <Sparkles size={13} />
                    </button>
                  )}

                  {onPhysicalIssue && (
                    <button
                      onClick={() => onPhysicalIssue(doc)}
                      className="btn-secondary"
                      style={{ padding: '5px 8px', fontSize: '0.78rem', borderRadius: 6, borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee' }}
                      title="Record Physical Issuance"
                    >
                      <PackageCheck size={13} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
