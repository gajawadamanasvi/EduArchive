import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  User,
  FileText,
  FileCheck2,
  FilePlus,
  Building2,
  Users,
  ShieldCheck,
  History,
  Settings,
  Bot,
  LogOut,
  Send,
  HelpCircle,
  BookOpen
} from 'lucide-react';

export const Sidebar = ({ onOpenChat }) => {
  const { user, isStudent, isCollegeAdmin, isSuperAdmin, logout } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My Profile', icon: User },
    { to: '/student/documents', label: 'My Documents', icon: FileText },
    { to: '/student/requests', label: 'Document Requests', icon: Send },
    { to: '/student/verification', label: 'Verification Status', icon: FileCheck2 }
  ];

  const collegeLinks = [
    { to: '/college/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/college/students', label: 'Students', icon: Users },
    { to: '/college/documents', label: 'Documents', icon: FileText },
    { to: '/college/upload', label: 'Upload Certificate', icon: FilePlus },
    { to: '/college/verification', label: 'Verification Queue', icon: FileCheck2 },
    { to: '/college/requests', label: 'Document Requests', icon: Send },
    { to: '/college/profile', label: 'College Profile', icon: Building2 }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Global Dashboard', icon: LayoutDashboard },
    { to: '/admin/colleges', label: 'Manage Colleges', icon: Building2 },
    { to: '/college/students', label: 'All Students', icon: Users },
    { to: '/college/documents', label: 'All Documents', icon: FileText },
    { to: '/college/verification', label: 'Verification Monitor', icon: ShieldCheck },
    { to: '/admin/audit-logs', label: 'System Audit Logs', icon: History },
    { to: '/admin/settings', label: 'Platform Settings', icon: Settings }
  ];

  let links = studentLinks;
  if (isCollegeAdmin) links = collegeLinks;
  if (isSuperAdmin) links = adminLinks;

  return (
    <aside style={{
      width: 260,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-glass)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 14px',
      position: 'sticky',
      top: 64,
      height: 'calc(100vh - 64px)'
    }}>
      {/* Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 6px' }}>
          {isSuperAdmin ? 'Super Admin Portal' : (isCollegeAdmin ? 'Institution Portal' : 'Student Portal')}
        </div>

        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                sidebar-link glow-card
                ${isActive ? 'sidebar-link-active' : ''}
              `}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.15))' : 'transparent',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              })}
            >
              <Icon size={18} className={item.to.includes('dashboard') ? 'text-blue-400' : ''} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={onOpenChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#a78bfa',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            marginTop: 8,
            textAlign: 'left'
          }}
          className="glow-card"
        >
          <Bot size={18} className="text-purple-400" />
          <span>AI Help Assistant</span>
        </button>
      </div>

      {/* Footer Utilities */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--border-glass)', paddingTop: 14 }}>
        <NavLink
          to="/docs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}
        >
          <BookOpen size={16} />
          <span>Developer Docs</span>
        </NavLink>

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: '0.82rem',
            color: '#fb7185'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
