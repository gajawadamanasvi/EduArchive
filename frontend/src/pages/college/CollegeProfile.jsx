import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { VerificationBadge } from '../../components/VerificationBadge.jsx';
import { Building2, Globe, Phone, Mail, MapPin, ShieldCheck, Lock, Check } from 'lucide-react';

export const CollegeProfile = () => {
  const { user } = useAuth();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    university: ''
  });

  const loadCollege = async () => {
    try {
      setLoading(true);
      const collegeId = user?.college?.id || user?.college_id;
      if (collegeId) {
        const data = await api.getCollegeById(collegeId);
        if (data.success && data.college) {
          setCollege(data.college);
          setFormData({
            name: data.college.name || '',
            address: data.college.address || '',
            phone: data.college.phone || '',
            website: data.college.website || '',
            university: data.college.university || ''
          });
        }
      }
    } catch (err) {
      console.error('[CollegeProfile] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollege();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!college) return;
    setSaving(true);
    setSuccessMsg(null);
    try {
      const data = await api.updateCollegeProfile(college.id, formData);
      if (data.success) {
        setSuccessMsg('Institution profile updated successfully.');
        setCollege(data.college);
      }
    } catch (err) {
      alert('Failed to update college profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-wrapper" style={{ color: 'var(--text-muted)' }}>Loading college profile...</div>;
  }

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            Institution Profile & Accreditation
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Institutional settings, public repository credentials, and cryptographic verification status
          </p>
        </div>

        {college && (
          <VerificationBadge status={college.verification_status} />
        )}
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.88rem' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        
        {/* Left Column: Accreditation Card */}
        <div className="glass-panel" style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 18,
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.25), rgba(15, 23, 42, 0.75))',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)'
          }}>
            <Building2 size={40} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              {college?.name}
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#60a5fa', fontWeight: 700, marginTop: 2 }}>
              Code: {college?.college_code}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {college?.university}
            </div>
          </div>

          {/* Accreditation Security Box */}
          <div style={{
            width: '100%',
            padding: '16px',
            borderRadius: 12,
            background: college?.verification_status === 'VERIFIED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
            border: college?.verification_status === 'VERIFIED' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)',
            textAlign: 'left',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: college?.verification_status === 'VERIFIED' ? '#34d399' : '#fbbf24', marginBottom: 6 }}>
              <ShieldCheck size={16} />
              <span>Platform Accreditation Status</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {college?.verification_status === 'VERIFIED' ? (
                <>Institution holds authenticated <strong>✓ Verified College</strong> credentials attested by the Super Admin.</>
              ) : (
                <>Accreditation is pending platform review. Only Super Administrators can grant verified college credentials.</>
              )}
            </div>
          </div>

          {/* Institutional Stats */}
          {college?.stats && (
            <div style={{ width: '100%', borderTop: '1px solid var(--border-glass)', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'center' }}>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{college.stats.totalStudents}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Students</div>
              </div>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>{college.stats.verifiedDocuments}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verified Docs</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: 18 }}>
            Institutional Contact & Address Information
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Institution Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Affiliated University
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Official Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Campus Physical Address
              </label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="submit" disabled={saving} className="btn-primary">
                <Check size={16} />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
