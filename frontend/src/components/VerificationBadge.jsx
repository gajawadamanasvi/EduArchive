import React from 'react';
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

export const VerificationBadge = ({ status, className = '' }) => {
  const norm = (status || '').toUpperCase();

  if (norm === 'VERIFIED') {
    return (
      <span className={`badge badge-college-verified ${className}`} title="Cryptographically verified institutional credential">
        <ShieldCheck size={14} className="text-blue-400" />
        <span className="font-bold tracking-wide">✓ VERIFIED COLLEGE</span>
      </span>
    );
  }

  if (norm === 'PENDING') {
    return (
      <span className={`badge badge-pending ${className}`} title="Awaiting Super Admin accreditation">
        <Clock size={13} />
        <span>Pending Accreditation</span>
      </span>
    );
  }

  if (norm === 'SUSPENDED') {
    return (
      <span className={`badge badge-rejected ${className}`} title="College authorization suspended">
        <ShieldAlert size={13} />
        <span>Suspended</span>
      </span>
    );
  }

  return null;
};
