import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { VerificationBadge } from './VerificationBadge.jsx';
import { 
  Shield, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  Sparkles, 
  BookOpen, 
  UserCheck,
  Bell
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, switchDemoUser, demoUsers, isStudent, isCollegeAdmin, isSuperAdmin } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleDemoSwitch = async (key) => {
    setShowDemoMenu(false);
    await switchDemoUser(key);
    if (key.includes('student')) {
      navigate('/student/dashboard');
    } else if (key.includes('apex') || key.includes('global')) {
      navigate('/college/dashboard');
    } else if (key.includes('superadmin')) {
      navigate('/admin/dashboard');
    }
  };

  const getRoleIcon = () => {
    if (isSuperAdmin) return <ShieldCheck size={16} className="text-amber-400" />;
    if (isCollegeAdmin) return <Building2 size={16} className="text-blue-400" />;
    return <GraduationCap size={16} className="text-emerald-400" />;
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'TELANGANA SUPER ADMIN';
    if (isCollegeAdmin) return 'COLLEGE ADMIN';
    return 'STUDENT';
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid var(--border-glass)', padding: '12px 28px', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        
        {/* Brand & Platform Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                EduArchive
              </span>
              <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontWeight: 700 }}>
                PROD v2.4
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Institutional Digital Certification Management & Verification System
            </div>
          </div>
        </div>

        {/* Center/Right Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          
          {/* Quick Demo Role Switcher Helper */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 8, gap: 6, borderColor: 'rgba(59, 130, 246, 0.3)' }}
              title="Switch demo role instantly for presentation"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Quick Role Switch</span>
              <ChevronDown size={12} />
            </button>

            {showDemoMenu && (
              <div className="glass-panel animate-fade-in" style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: 320,
                padding: '8px',
                zIndex: 100,
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Demo Accounts (1-Click Switch)
                </div>
                {demoUsers.map((u) => {
                  const isActive = user?.email === u.email;
                  return (
                    <button
                      key={u.key}
                      onClick={() => handleDemoSwitch(u.key)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        marginBottom: 4
                      }}
                      className="glow-card"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: isActive ? '#60a5fa' : '#f1f5f9' }}>
                          {u.name}
                        </span>
                        <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, background: '#1e293b', color: '#94a3b8' }}>
                          {u.role}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {u.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Docs link */}
          <Link
            to="/docs"
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 8, gap: 6 }}
            title="System Documentation & Developer Notes"
          >
            <BookOpen size={14} className="text-cyan-400" />
            <span>Docs</span>
          </Link>

          {/* College Badge if College Admin */}
          {isCollegeAdmin && user?.college && (
            <VerificationBadge status={user.college.verification_status} />
          )}

          {/* User Profile Pill */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={user.name}
                style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e293b', border: '1px solid #334155' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {user.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  {getRoleIcon()}
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                    {getRoleLabel()}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                style={{ padding: 6, borderRadius: 6, color: '#ef4444', marginLeft: 6 }}
                className="glow-card"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
