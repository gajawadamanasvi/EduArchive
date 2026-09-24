import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, PackageCheck, ShieldAlert, Sparkles, Award } from 'lucide-react';

export const StatusBadge = ({ status, isOriginal = false, custodyStatus, className = '' }) => {
  const normStatus = (status || '').toUpperCase();

  const renderBadge = () => {
    switch (normStatus) {
      case 'VERIFIED':
        return (
          <span className={`badge badge-verified ${className}`}>
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>✓ Verified</span>
          </span>
        );

      case 'PENDING':
        return (
          <span className={`badge badge-pending ${className}`}>
            <Clock size={13} className="text-amber-400" />
            <span>⏳ Pending</span>
          </span>
        );

      case 'NEEDS_REVIEW':
      case 'NEEDS_MANUAL_REVIEW':
        return (
          <span className={`badge badge-review ${className}`}>
            <AlertTriangle size={13} className="text-purple-400" />
            <span>! Needs Review</span>
          </span>
        );

      case 'REJECTED':
        return (
          <span className={`badge badge-rejected ${className}`}>
            <XCircle size={13} className="text-rose-400" />
            <span>✕ Not Verified / Rejected</span>
          </span>
        );

      case 'PHYSICAL_ISSUED':
        return (
          <span className={`badge badge-issued ${className}`}>
            <PackageCheck size={13} className="text-cyan-400" />
            <span>📦 Physical Certificate Issued</span>
          </span>
        );

      case 'AI_CONSISTENT':
      case 'CONSISTENT':
        return (
          <span className={`badge badge-verified ${className}`}>
            <Sparkles size={13} className="text-emerald-400" />
            <span>🟢 AI Consistent</span>
          </span>
        );

      case 'SUSPICIOUS':
      case 'SUSPICIOUS_MISMATCH':
        return (
          <span className={`badge badge-rejected ${className}`}>
            <ShieldAlert size={13} className="text-rose-400" />
            <span>🔴 AI Mismatch Flagged</span>
          </span>
        );

      case 'APPROVED':
        return (
          <span className={`badge badge-verified ${className}`}>
            <CheckCircle2 size={13} />
            <span>Approved</span>
          </span>
        );

      case 'ISSUED':
        return (
          <span className={`badge badge-issued ${className}`}>
            <PackageCheck size={13} />
            <span>Issued</span>
          </span>
        );

      default:
        return (
          <span className={`badge bg-slate-800 text-slate-300 border border-slate-700 ${className}`}>
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {renderBadge()}
      {isOriginal && (
        <span
          className="badge"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            fontWeight: 700,
            fontSize: '0.72rem'
          }}
          title="Physical Original Certificate deposited in institutional repository"
        >
          <Award size={12} className="text-amber-400" />
          <span>Original in Vault</span>
        </span>
      )}
    </div>
  );
};
