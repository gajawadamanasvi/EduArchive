import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { History, Search, Filter, ShieldCheck, Download, Code2, X } from 'lucide-react';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLogDetails, setSelectedLogDetails] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs(150);
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('[AdminAuditLogs] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const q = search.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.user_name && log.user_name.toLowerCase().includes(q)) ||
      (log.entity_type && log.entity_type.toLowerCase().includes(q)) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
          Platform Audit Logs & Event Trail
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Cryptographically recorded administrative actions, uploads, verifications, status modifications, and access logs
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
          <input
            type="text"
            placeholder="Search action event, user name, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 36 }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
        </div>

        <button onClick={fetchLogs} className="btn-secondary" style={{ padding: '8px 14px' }}>
          Refresh Trail
        </button>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading audit records...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No audit logs match the query.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Action Event</th>
                <th style={{ padding: '14px 18px' }}>Actor User</th>
                <th style={{ padding: '14px 18px' }}>Target Entity</th>
                <th style={{ padding: '14px 18px' }}>IP Origin</th>
                <th style={{ padding: '14px 18px' }}>Recorded At</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#60a5fa' }}>
                    {log.action}
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{log.user_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.user_role}</div>
                  </td>

                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', fontSize: '0.78rem' }}>
                      {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                    </span>
                  </td>

                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {log.ip_address}
                  </td>

                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedLogDetails(log)}
                      className="btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: 6 }}
                    >
                      <Code2 size={13} />
                      <span>Inspect JSON</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JSON Inspector Modal */}
      {selectedLogDetails && (
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
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 560, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Audit Log Payload Details
              </h3>
              <button onClick={() => setSelectedLogDetails(null)} className="hover:text-white" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 12, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Action: <strong style={{ color: '#60a5fa' }}>{selectedLogDetails.action}</strong> • User: {selectedLogDetails.user_name}
            </div>

            <pre style={{
              background: '#090d16',
              padding: '16px',
              borderRadius: 10,
              border: '1px solid #1e293b',
              color: '#38bdf8',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              maxHeight: 340,
              overflowY: 'auto'
            }}>
              {typeof selectedLogDetails.details === 'string'
                ? selectedLogDetails.details
                : JSON.stringify(selectedLogDetails.details, null, 2)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setSelectedLogDetails(null)} className="btn-primary">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
