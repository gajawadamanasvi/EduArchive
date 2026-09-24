import React from 'react';
import { StatusBadge } from './StatusBadge.jsx';
import { VerificationBadge } from './VerificationBadge.jsx';
import { 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  Calendar, 
  Building2, 
  User, 
  PackageCheck,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const DocumentCard = ({ 
  document, 
  onView, 
  onDownload, 
  onInspectAI, 
  onPhysicalIssue,
  showActions = true,
  isCollegeView = false 
}) => {
  const isVerified = document.status === 'VERIFIED';
  const isPhysicalIssued = document.status === 'PHYSICAL_ISSUED';
  const hasAiRecord = Boolean(document.verification?.ai_result);

  return (
    <div className="glass-panel glow-card" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 16,
      border: isPhysicalIssued 
        ? '1px solid rgba(6, 182, 212, 0.4)' 
        : (isVerified ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-glass)')
    }}>
      
      {/* Header with Type & Status */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa'
            }}>
              <FileText size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
                {document.document_type}
              </span>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.25 }}>
                {document.title}
              </h3>
            </div>
          </div>
          <StatusBadge status={document.status} isOriginal={document.is_original} />
        </div>

        {/* Institution / Student Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
          {document.college && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={14} className="text-blue-400" />
              <span>{document.college.name}</span>
              {document.college.verification_status === 'VERIFIED' && (
                <span title="Verified Institution" style={{ color: '#60a5fa', fontWeight: 800 }}>✓</span>
              )}
            </div>
          )}

          {isCollegeView && document.student && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} className="text-emerald-400" />
              <span>{document.student.name} ({document.student.roll_number})</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} className="text-muted" />
            <span>Uploaded: {new Date(document.upload_date).toLocaleDateString()}</span>
          </div>

          {document.is_original && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontSize: '0.76rem', fontWeight: 600 }}>
              <span>🏛️ Physical Vault Custody: {document.locker_reference || 'College Academic Safe Vault'}</span>
            </div>
          )}
        </div>

        {/* Physical Issue Alert Banner if active */}
        {isPhysicalIssued && document.physical_issue_details && (
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            fontSize: '0.75rem',
            color: '#67e8f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              <PackageCheck size={14} />
              <span>Physical Certificate Issued ({document.physical_issue_details.issued_date})</span>
            </div>
            <div style={{ marginTop: 2, color: 'var(--text-secondary)' }}>
              Remark: {document.physical_issue_details.remark}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderTop: '1px solid var(--border-glass)', paddingTop: 14 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => onView(document)}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 8 }}
              title="View certificate"
            >
              <Eye size={14} />
              <span>View</span>
            </button>

            <button
              onClick={() => onDownload(document)}
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 8 }}
              title="Download authorized certificate"
            >
              <Download size={14} />
              <span>Download</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {/* AI OCR Inspector Trigger */}
            {onInspectAI && (
              <button
                onClick={() => onInspectAI(document)}
                className="btn-secondary"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  borderRadius: 8,
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  color: '#c084fc'
                }}
                title="Inspect AI Verification Report & OCR"
              >
                <Sparkles size={14} />
                <span>AI Scan</span>
              </button>
            )}

            {/* Physical Issue Trigger for College Admins */}
            {onPhysicalIssue && (
              <button
                onClick={() => onPhysicalIssue(document)}
                className="btn-secondary"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  borderRadius: 8,
                  borderColor: 'rgba(6, 182, 212, 0.3)',
                  color: '#22d3ee'
                }}
                title="Record or update physical issuance status"
              >
                <PackageCheck size={14} />
                <span>Physical</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
