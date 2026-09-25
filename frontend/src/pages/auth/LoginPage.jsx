import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { 
  Shield, 
  LogIn, 
  ArrowRight, 
  Lock, 
  Mail, 
  CheckCircle2, 
  UserCheck, 
  GraduationCap, 
  Building2, 
  ChevronRight, 
  ArrowLeft,
  Search,
  School,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  Palette
} from 'lucide-react';

export const LoginPage = () => {
  const { login, demoUsers, switchDemoUser } = useAuth();
  const { theme, setTheme, palette, setPalette, palettes, activePalette, isDark, isLight } = useTheme();
  const [email, setEmail] = useState('aarav.sharma@student.edu');
  const [password, setPassword] = useState('StudentPass@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('roles'); // 'roles' | 'students' | 'colleges'
  const [studentSearch, setStudentSearch] = useState('');
  const navigate = useNavigate();

  const superAdmin = demoUsers.find(u => u.role === 'SUPER_ADMIN');
  const collegeAdmins = demoUsers.filter(u => u.role === 'COLLEGE_ADMIN');
  const studentUsers = demoUsers.filter(u => u.role === 'STUDENT');

  // Group students by college name
  const studentsByCollege = studentUsers.reduce((acc, student) => {
    const colName = student.collegeName || 'Affiliated Colleges';
    if (!acc[colName]) acc[colName] = [];
    acc[colName].push(student);
    return acc;
  }, {});

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (result.success && result.user) {
      if (result.user.role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else if (result.user.role === 'COLLEGE_ADMIN') navigate('/college/dashboard');
      else navigate('/student/dashboard');
    } else {
      setError(result.error || 'Invalid credentials.');
    }
  };

  const handleSelectAccount = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setLoading(true);
    setError(null);
    const result = await switchDemoUser(account.key);
    setLoading(false);
    if (result.success && result.user) {
      if (result.user.role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else if (result.user.role === 'COLLEGE_ADMIN') navigate('/college/dashboard');
      else navigate('/student/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      zIndex: 1
    }}>
      
      {/* Top Header Theme & Color Palette Selector Bar */}
      <div style={{
        width: '100%',
        maxWidth: 1060,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={20} className="text-blue-500" />
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            EduArchive
          </span>
          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', fontWeight: 700 }}>
            {activePalette?.name}
          </span>
        </div>

        {/* Color Palette Selector Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
          background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.95)',
          padding: '5px 8px',
          borderRadius: 14,
          border: isDark ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid rgba(203, 213, 225, 0.8)',
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(15, 23, 42, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 4, fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <Palette size={13} />
            <span>Theme:</span>
          </div>

          {palettes.map((p) => {
            const isSelected = palette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPalette(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  background: isSelected 
                    ? (isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff') 
                    : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: isSelected 
                    ? `1.5px solid ${p.primary}` 
                    : '1.5px solid transparent',
                  boxShadow: isSelected 
                    ? `0 0 12px ${p.primary}40` 
                    : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={`${p.name} (${p.mode === 'dark' ? 'Dark' : 'Light'} Mode)`}
              >
                {/* 3-Color Swatch Dots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.primary }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.secondary }} />
                </div>
                <span>{p.name}</span>
                {p.mode === 'dark' ? (
                  <Moon size={11} style={{ opacity: 0.6 }} />
                ) : (
                  <Sun size={11} style={{ opacity: 0.8, color: '#eab308' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: 1060,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.85)' : '0 20px 50px rgba(15, 23, 42, 0.12)',
        border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(203, 213, 225, 0.8)'
      }}>
        
        {/* Left Side: System Information & Institutional Roles */}
        <div style={{
          padding: '36px',
          background: isDark 
            ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(15, 23, 42, 0.85))'
            : 'linear-gradient(135deg, rgba(239, 246, 255, 0.9), rgba(248, 250, 252, 0.95))',
          borderRight: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
              }}>
                <Shield size={26} color="#ffffff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  EduArchive
                </h1>
                <div style={{ fontSize: '0.78rem', color: isDark ? '#93c5fd' : '#2563eb', fontWeight: 600, lineHeight: 1.35, marginTop: 2 }}>
                  Institutional Digital Certification Management and Verification System
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
              Secure institutional repository platform enabling accredited colleges to digitally store, verify, and issue students' authentic academic certificates with automated AI OCR cross-referencing.
            </p>

            {/* Role & Student Selection Container */}
            <div style={{ 
              background: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.9)', 
              padding: '16px', 
              borderRadius: 14, 
              border: isDark ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid rgba(203, 213, 225, 0.8)',
              boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              
              {/* Top-Level Role Menu */}
              {activeView === 'roles' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.04em' }}>
                    <UserCheck size={14} />
                    <span>Select Account Role</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Super Admin */}
                    {superAdmin && (
                      <button
                        type="button"
                        onClick={() => handleSelectAccount(superAdmin)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: 10,
                          background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                          textAlign: 'left',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                        className="glow-card"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>Super Admin</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{superAdmin.name}</div>
                          </div>
                        </div>
                        <ArrowRight size={15} className="text-purple-400" />
                      </button>
                    )}

                    {/* College Admin Option */}
                    <button
                      type="button"
                      onClick={() => setActiveView('colleges')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                        textAlign: 'left',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      className="glow-card"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>College Administrators</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            TKREC • CBIT • Apex Tech • Global Univ ({collegeAdmins.length} Institutions)
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-blue-400" />
                    </button>

                    {/* Unified Students Option */}
                    <button
                      type="button"
                      onClick={() => setActiveView('students')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: isDark ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))',
                        border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.4)',
                        textAlign: 'left',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      className="glow-card"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16, 185, 129, 0.25)', color: isDark ? '#34d399' : '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: isDark ? '#34d399' : '#059669' }}>Students</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            View & select students across {Object.keys(studentsByCollege).length} colleges ({studentUsers.length} students)
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-emerald-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* College Admins View */}
              {activeView === 'colleges' && (
                <div className="animate-fade-in" style={{ maxHeight: 310, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => setActiveView('roles')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'transparent',
                        border: 'none',
                        color: isDark ? '#60a5fa' : '#2563eb',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Roles</span>
                    </button>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select College Admin</span>
                  </div>

                  <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                    {collegeAdmins.map((admin) => (
                      <button
                        key={admin.key}
                        type="button"
                        onClick={() => handleSelectAccount(admin)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
                          textAlign: 'left',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                        className="glow-card"
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{admin.collegeName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{admin.name} • <span style={{ color: isDark ? '#60a5fa' : '#2563eb' }}>{admin.email}</span></div>
                        </div>
                        <ArrowRight size={14} className="text-blue-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Students Grouped By College View */}
              {activeView === 'students' && (
                <div className="animate-fade-in" style={{ maxHeight: 310, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <button
                      type="button"
                      onClick={() => setActiveView('roles')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'transparent',
                        border: 'none',
                        color: isDark ? '#34d399' : '#059669',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Roles</span>
                    </button>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Select Student</span>
                  </div>

                  {/* Search filter for students */}
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <input
                      type="text"
                      placeholder="Search student by name, roll, or branch..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="input-field"
                      style={{ fontSize: '0.76rem', padding: '6px 10px 6px 30px', height: 32 }}
                    />
                    <Search size={13} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                  </div>

                  {/* College Grouped Student List */}
                  <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
                    {Object.entries(studentsByCollege).map(([collegeName, students]) => {
                      const filtered = students.filter(s => 
                        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                        (s.course && s.course.toLowerCase().includes(studentSearch.toLowerCase())) ||
                        (s.rollNumber && s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()))
                      );

                      if (filtered.length === 0) return null;

                      return (
                        <div key={collegeName} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 700, color: isDark ? '#93c5fd' : '#2563eb', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', paddingBottom: 3 }}>
                            <School size={12} />
                            <span>{collegeName}</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {filtered.map((s) => (
                              <button
                                key={s.key}
                                type="button"
                                onClick={() => handleSelectAccount(s)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 10px',
                                  borderRadius: 8,
                                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                                  border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #cbd5e1',
                                  textAlign: 'left',
                                  color: 'var(--text-primary)',
                                  cursor: 'pointer',
                                  boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)'
                                }}
                                className="glow-card"
                              >
                                <div>
                                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {s.name} <span style={{ fontSize: '0.7rem', color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 500 }}>({s.rollNumber})</span>
                                  </div>
                                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                    {s.course}
                                  </div>
                                </div>
                                <ArrowRight size={13} className="text-emerald-500" />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Encrypted JWT Sessions • Relational Storage • AI Verification</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div style={{ 
          padding: '36px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          background: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.6)'
        }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Sign In to Your Portal
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Enter your registered institutional credentials below.
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: '0.86rem', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Gmail / Email Address or Student Roll No
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. rahul@gmail.com or 22TK1A0501"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 38 }}
                />
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 38, paddingRight: 38 }}
                />
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: 10, fontSize: '0.95rem' }}
            >
              <LogIn size={18} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div style={{ 
            marginTop: 24, 
            textAlign: 'center', 
            fontSize: '0.82rem', 
            color: 'var(--text-secondary)', 
            padding: '10px 14px', 
            borderRadius: 8, 
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(241, 245, 249, 0.8)', 
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(203, 213, 225, 0.7)' 
          }}>
            🔒 <strong>Institutional Enrollment</strong>: Student accounts & original certificates are officially registered by College Administrators.
          </div>
        </div>

      </div>
    </div>
  );
};

