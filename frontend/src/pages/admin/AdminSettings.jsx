import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Settings, Save, Check, Sparkles, Shield, Database, Cpu } from 'lucide-react';

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    systemName: 'Student Document Verification & Retrieval System',
    allowStudentRegistrations: true,
    requireAdminCollegeVerification: true,
    aiModel: 'Built-in Neural OCR + Verification Agent v2.4',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await api.getSystemSettings();
        if (data.success && data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      } catch (err) {
        console.error('[AdminSettings] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      const data = await api.updateSystemSettings(settings);
      if (data.success) {
        setSuccessMsg('Platform settings saved successfully.');
      }
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-wrapper" style={{ color: 'var(--text-muted)' }}>Loading platform settings...</div>;
  }

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: 840, display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
          Platform Global Configuration
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          System security parameters, AI verification engines, and enrollment policies
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.88rem' }}>
          ✓ {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Platform Title / System Name
          </label>
          <input
            type="text"
            value={settings.systemName}
            onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            AI Verification Engine Model
          </label>
          <select
            value={settings.aiModel}
            onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
            className="input-field"
          >
            <option value="Built-in Neural OCR + Verification Agent v2.4">Built-in Neural OCR + Verification Agent v2.4 (Active)</option>
            <option value="Google Gemini 1.5 Flash Vision Engine">Google Gemini 1.5 Flash Vision Engine</option>
            <option value="OpenAI GPT-4o Multimodal OCR">OpenAI GPT-4o Multimodal OCR</option>
          </select>
        </div>

        {/* Policy Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--border-glass)', paddingTop: 18 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                Allow Public Student Self-Registration
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Enable students to self-register their account and select their affiliated college
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.allowStudentRegistrations}
              onChange={(e) => setSettings({ ...settings, allowStudentRegistrations: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: '#3b82f6', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                Enforce Strict Super-Admin College Verification Badges
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Requires explicit platform Super Admin authorization before granting "✓ Verified College" status
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.requireAdminCollegeVerification}
              onChange={(e) => setSettings({ ...settings, requireAdminCollegeVerification: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: '#3b82f6', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                Maintenance Mode
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Restrict non-administrative logins for scheduled infrastructure upgrades
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: '#f43f5e', cursor: 'pointer' }}
            />
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Global Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
