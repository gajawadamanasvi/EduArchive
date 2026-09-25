import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { VerificationBadge } from '../../components/VerificationBadge.jsx';
import { 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Search, 
  Check, 
  X, 
  Globe, 
  Mail, 
  Phone,
  Users,
  FileText,
  MapPin,
  Landmark
} from 'lucide-react';

export const AdminColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [newCollege, setNewCollege] = useState({
    name: '',
    college_code: '',
    email: '',
    phone: '',
    website: '',
    university: 'Jawaharlal Nehru Technological University Hyderabad (JNTUH)',
    address: 'Hyderabad, Telangana',
    state: 'Telangana'
  });
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const data = await api.getColleges({
        search,
        status: statusFilter
      });
      if (data.success) {
        setColleges(data.colleges || []);
      }
    } catch (err) {
      console.error('[AdminColleges] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchColleges();
  };

  const handleToggleVerification = async (collegeId, currentStatus) => {
    const nextStatus = currentStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
    setUpdatingId(collegeId);
    try {
      await api.updateCollegeVerification(collegeId, nextStatus);
      fetchColleges();
    } catch (err) {
      alert('Failed to update college verification badge: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSuspendCollege = async (collegeId) => {
    if (!confirm('Are you sure you want to suspend this Telangana college? Its administrators and students will be restricted.')) return;
    setUpdatingId(collegeId);
    try {
      await api.updateCollegeVerification(collegeId, 'SUSPENDED');
      fetchColleges();
    } catch (err) {
      alert('Failed to suspend college: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    setCreating(true);
    setModalError(null);
    try {
      const data = await api.createCollege({
        ...newCollege,
        state: 'Telangana'
      });
      if (data.success) {
        setShowAddModal(false);
        setNewCollege({
          name: '',
          college_code: '',
          email: '',
          phone: '',
          website: '',
          university: 'Jawaharlal Nehru Technological University Hyderabad (JNTUH)',
          address: 'Hyderabad, Telangana',
          state: 'Telangana'
        });
        fetchColleges();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to create college.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Telangana State Jurisdiction Header */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(15, 23, 42, 0.9))',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.35)'
          }}>
            <Landmark size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                Telangana State Academic Institutions & Accreditation
              </h2>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', fontWeight: 800 }}>
                📍 TELANGANA JURISDICTION ONLY
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Main Admin access is exclusively restricted to Telangana State engineering & university institutions.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setModalError(null);
            setShowAddModal(true);
          }}
          className="btn-primary"
          style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          <Plus size={16} />
          <span>Add Telangana College</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search Telangana colleges by name, code (e.g., TKREC, CBIT), or university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 36 }}
            />
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
          style={{ width: 'auto', paddingRight: 32 }}
        >
          <option value="">All Telangana Accreditation Statuses</option>
          <option value="VERIFIED">Verified Colleges Only</option>
          <option value="PENDING">Pending Accreditation</option>
          <option value="SUSPENDED">Suspended Institutions</option>
        </select>
      </div>

      {/* Colleges List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Telangana college directory...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {colleges.map((c) => {
            const isVerified = c.verification_status === 'VERIFIED';
            const isSuspended = c.verification_status === 'SUSPENDED';

            return (
              <div key={c.id} className="glass-panel glow-card" style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 16,
                border: isVerified ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border-glass)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 800
                      }}>
                        <Building2 size={24} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#60a5fa' }}>{c.college_code}</span>
                          <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            Telangana
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginTop: 2 }}>
                          {c.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <VerificationBadge status={c.verification_status} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div>Affiliation: <strong style={{ color: '#e2e8f0' }}>{c.university}</strong></div>
                    {c.address && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <MapPin size={13} className="text-muted" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.76rem' }}>{c.address}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={13} className="text-muted" />
                      <span>{c.email}</span>
                    </div>
                    {c.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={13} className="text-muted" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* College Stats */}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-glass)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, textAlign: 'center', fontSize: '0.78rem' }}>
                    <div style={{ padding: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                      <div style={{ fontWeight: 800, color: '#ffffff' }}>{c.studentCount ?? 0}</div>
                      <div style={{ color: 'var(--text-muted)' }}>Students Enrolled</div>
                    </div>
                    <div style={{ padding: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                      <div style={{ fontWeight: 800, color: '#34d399' }}>{c.verifiedDocCount ?? 0}</div>
                      <div style={{ color: 'var(--text-muted)' }}>Verified Docs</div>
                    </div>
                  </div>
                </div>

                {/* Super Admin Control Actions */}
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border-glass)', paddingTop: 14 }}>
                  <button
                    onClick={() => handleToggleVerification(c.id, c.verification_status)}
                    disabled={updatingId === c.id}
                    className={isVerified ? 'btn-secondary' : 'btn-emerald'}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    <ShieldCheck size={14} />
                    <span>{isVerified ? 'Revoke Verified Badge' : 'Grant Verified Badge'}</span>
                  </button>

                  {!isSuspended && (
                    <button
                      onClick={() => handleSuspendCollege(c.id)}
                      disabled={updatingId === c.id}
                      className="btn-danger"
                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                      title="Suspend Telangana institution"
                    >
                      <ShieldAlert size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add College Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 580, padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Register Telangana Academic Institution
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                  Jurisdiction: Telangana State Only
                </span>
              </div>
              <button onClick={() => setShowAddModal(false)} className="hover:text-white" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: '0.85rem', marginBottom: 16 }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateCollege} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Institution Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Teegala Krishna Reddy Engineering College (TKREC)"
                  value={newCollege.name}
                  onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    College Code (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TKREC-HYD"
                    value={newCollege.college_code}
                    onChange={(e) => setNewCollege({ ...newCollege, college_code: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    State Jurisdiction
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Telangana"
                    className="input-field"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#34d399', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@tkrec.ac.in"
                    value={newCollege.email}
                    onChange={(e) => setNewCollege({ ...newCollege, email: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 40 2409 2555"
                    value={newCollege.phone}
                    onChange={(e) => setNewCollege({ ...newCollege, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Affiliated University (Telangana)
                </label>
                <input
                  type="text"
                  value={newCollege.university}
                  onChange={(e) => setNewCollege({ ...newCollege, university: e.target.value })}
                  className="input-field"
                  placeholder="JNTUH / Osmania University / Kakatiya University"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Official Website
                </label>
                <input
                  type="url"
                  placeholder="https://tkrec.ac.in"
                  value={newCollege.website}
                  onChange={(e) => setNewCollege({ ...newCollege, website: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Campus Address (in Telangana)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Medbowli, Meerpet, Saroornagar, Hyderabad, Telangana 500097"
                  value={newCollege.address}
                  onChange={(e) => setNewCollege({ ...newCollege, address: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  <Plus size={16} />
                  <span>{creating ? 'Adding...' : 'Register Telangana College'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
