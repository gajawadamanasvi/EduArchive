import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { DashboardCard } from '../../components/DashboardCard.jsx';
import { 
  Building2, 
  Users, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  History, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes] = await Promise.all([
        api.getGlobalStats(),
        api.getAuditLogs(5)
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (logsRes.success) setRecentLogs(logsRes.logs || []);
    } catch (err) {
      console.error('[AdminDashboard] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      
      {/* Super Admin Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(15, 23, 42, 0.85))',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                Super Administrator Master Console
              </h2>
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', fontWeight: 800 }}>
                FULL AUTHORITY
              </span>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              System-wide institutional oversight, college accreditation authority, and cryptographic audit monitoring
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/colleges" className="btn-primary" style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Building2 size={16} />
            <span>Manage Colleges</span>
          </Link>
          <Link to="/admin/audit-logs" className="btn-secondary" style={{ padding: '10px 16px' }}>
            <History size={16} />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* Global Statistics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <DashboardCard
          title="Colleges Enrolled"
          value={stats?.totalColleges ?? '...'}
          icon={Building2}
          color="amber"
          subtitle={`${stats?.verifiedColleges ?? 0} Verified Institutions`}
        />
        <DashboardCard
          title="Total Students"
          value={stats?.totalStudents ?? '...'}
          icon={Users}
          color="blue"
          subtitle="Enrolled active students"
        />
        <DashboardCard
          title="Certificates Archived"
          value={stats?.totalDocuments ?? '...'}
          icon={FileText}
          color="cyan"
          subtitle="Repository total"
        />
        <DashboardCard
          title="Verified Documents"
          value={stats?.verifiedDocuments ?? '...'}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Officially authenticated"
        />
        <DashboardCard
          title="Pending / Needs Review"
          value={stats?.pendingDocuments ?? '...'}
          icon={AlertTriangle}
          color="rose"
          subtitle="Active review queue"
        />
      </div>

      {/* Audit Logs Preview */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              Real-Time System Audit Trail
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tamper-proof event logs for all administrative actions, uploads, downloads, and verifications
            </p>
          </div>

          <Link to="/admin/audit-logs" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>
            <span>View All Logs</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 18px' }}>Action Event</th>
                <th style={{ padding: '12px 18px' }}>User / Role</th>
                <th style={{ padding: '12px 18px' }}>Target Entity</th>
                <th style={{ padding: '12px 18px' }}>IP Address</th>
                <th style={{ padding: '12px 18px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 600, color: '#60a5fa' }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '12px 18px', color: 'var(--text-primary)' }}>
                    <div>{log.user_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.user_role}</div>
                  </td>
                  <td style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>
                    {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                  </td>
                  <td style={{ padding: '12px 18px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {log.ip_address}
                  </td>
                  <td style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
