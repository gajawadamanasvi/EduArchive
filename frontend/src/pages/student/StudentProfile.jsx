import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { VerificationBadge } from '../../components/VerificationBadge.jsx';
import { 
  User, 
  Lock, 
  Building2, 
  Phone, 
  Mail, 
  GraduationCap, 
  Calendar, 
  ShieldCheck, 
  Send, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showRequestChangeModal, setShowRequestChangeModal] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [changeField, setChangeField] = useState('Roll Number');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentProfile();
      if (data.success && data.student) {
        setProfile(data.student);
        setPhone(data.student.phone || '');
      }
    } catch (err) {
      console.error('[StudentProfile] Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSavePhone = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSuccessMsg(null);
    try {
      const data = await api.updateStudentProfile(profile.id, { phone });
      if (data.success) {
        setSuccessMsg('Phone number updated successfully.');
        setProfile(data.student);
      }
    } catch (err) {
      alert('Failed to update phone: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitProfileChangeRequest = async (e) => {
    e.preventDefault();
    try {
      await api.createDocumentRequest({
        document_type: `Profile Correction: ${changeField}`,
        reason: changeReason,
        urgent: false
      });
      alert('Profile modification request submitted to college administration for review.');
      setShowRequestChangeModal(false);
      setChangeReason('');
    } catch (err) {
      alert('Failed to submit request: ' + err.message);
    }
  };

  if (loading) {
    return <div className="page-wrapper" style={{ color: 'var(--text-muted)' }}>Loading profile credentials...</div>;
  }

  const collegeName = profile?.college?.name || user?.college_name || 'Apex Institute of Technology';

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            Student Identity Profile
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Official institutional academic record and contact settings
          </p>
        </div>

        <button
          onClick={() => setShowRequestChangeModal(true)}
          className="btn-secondary"
          style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}
        >
          <Send size={15} />
          <span>Request Official Record Change</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.88rem' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Main Profile Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        
        {/* Left Column: ID Card Visual */}
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
          <div style={{ position: 'relative' }}>
            <img
              src={profile?.profile_photo || user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
              alt={user?.name}
              style={{ width: 96, height: 96, borderRadius: '50%', border: '3px solid #3b82f6', background: '#1e293b' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#10b981',
              color: '#ffffff',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px #10b981'
            }}>
              <ShieldCheck size={16} />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              {profile?.user?.name || user?.name}
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#60a5fa', fontWeight: 600, marginTop: 2 }}>
              Roll No: {profile?.roll_number}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              ID: {profile?.student_id_number}
            </div>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-glass)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
              <Building2 size={16} className="text-blue-400" />
              <span>{collegeName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
              <GraduationCap size={16} className="text-emerald-400" />
              <span>{profile?.course}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
              <Calendar size={16} className="text-purple-400" />
              <span>Batch Session: {profile?.academic_year || '2022-2026'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Safe Editor */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
            Institutional Credentials & Contact
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <Lock size={12} />
                <span>Roll Number (Official)</span>
              </label>
              <div style={{ marginTop: 4, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>
                {profile?.roll_number}
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <Lock size={12} />
                <span>Student ID Number</span>
              </label>
              <div style={{ marginTop: 4, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>
                {profile?.student_id_number}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <Lock size={12} />
              <span>Department / Specialization</span>
            </label>
            <div style={{ marginTop: 4, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: '#94a3b8', fontSize: '0.88rem' }}>
              {profile?.department || 'Department of Computer Science & Engineering'}
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <Lock size={12} />
              <span>Registered Email Address</span>
            </label>
            <div style={{ marginTop: 4, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: '#94a3b8', fontSize: '0.88rem' }}>
              {profile?.user?.email || user?.email}
            </div>
          </div>

          {/* Editable Safe Field: Phone */}
          <form onSubmit={handleSavePhone} style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 18 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Contact Phone Number (Editable by Student)
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="input-field"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ padding: '10px 18px', whiteSpace: 'nowrap' }}
              >
                <Check size={16} />
                <span>{saving ? 'Saving...' : 'Save Phone'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Request Official Change Modal */}
      {showRequestChangeModal && (
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
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 500, padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
              Request Official Profile Change
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Official identifiers cannot be modified directly by students to ensure tamper-proof institutional integrity. Submit a formal change request to the Dean/Registrar.
            </p>

            <form onSubmit={handleSubmitProfileChangeRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Target Record Field
                </label>
                <select
                  value={changeField}
                  onChange={(e) => setChangeField(e.target.value)}
                  className="input-field"
                >
                  <option value="Roll Number">Roll Number</option>
                  <option value="Legal Name Spelling">Legal Name Spelling</option>
                  <option value="Course / Program">Course / Degree Program</option>
                  <option value="Student ID Number">Student ID Number</option>
                  <option value="Academic Batch Year">Academic Batch Year</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Reason & Supporting Details
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this official record needs correction..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowRequestChangeModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Send size={15} />
                  <span>Submit Change Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
