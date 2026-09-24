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
  FileText
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
    university: 'State University',
    address: ''
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
    if (!confirm('Are you sure you want to suspend this college? Its administrators and students will be restricted.')) return;
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
      const data = await api.createCollege(newCollege);
      if (data.success) {
        setShowAddModal(false);
        setNewCollege({
          name: '',
          college_code: '',
          email: '',
          phone: '',
          website: '',
          university: 'State University',
          address: ''
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
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            Participating Colleges & Accreditation Authority
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Only Super Administrators have authority to issue the official <strong>✓ Verified College</strong> accreditation badge
          </p>
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
          <span>Add Academic Institution</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search college by name, code, or university..."
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
          <option value="">All Accreditation Statuses</option>
          <option value="VERIFIED">Verified Colleges Only</option>
          <option value="PENDING">Pending Accreditation</option>
          <option value="SUSPENDED">Suspended Institutions</option>
        </select>
      </div>

      {/* Colleges List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading college directory...</div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}>
                        <Building2 size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#60a5fa' }}>{c.college_code}</span>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
                          {c.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <VerificationBadge status={c.verification_status} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div>Affiliation: {c.university}</div>
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
                      <div style={{ color: 'var(--text-muted)' }}>Students</div>
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
                      title="Suspend institution"
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Add New Academic Institution
              </h3>
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
                  College / Institution Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Institute of Technology"
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
                    placeholder="e.g. NIT-TECH"
                    value={newCollege.college_code}
                    onChange={(e) => setNewCollege({ ...newCollege, college_code: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="registrar@nit.edu"
                    value={newCollege.email}
                    onChange={(e) => setNewCollege({ ...newCollege, email: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Affiliated University
                  </label>
                  <input
                    type="text"
                    value={newCollege.university}
                    onChange={(e) => setNewCollege({ ...newCollege, university: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newCollege.phone}
                    onChange={(e) => setNewCollege({ ...newCollege, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Official Website
                </label>
                <input
                  type="url"
                  placeholder="https://nit.edu"
                  value={newCollege.website}
                  onChange={(e) => setNewCollege({ ...newCollege, website: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Campus Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Campus location..."
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
                  <span>{creating ? 'Adding...' : 'Register College'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
