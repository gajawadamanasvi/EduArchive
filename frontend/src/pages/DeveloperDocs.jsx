import React, { useState } from 'react';
import { 
  BookOpen, 
  Code2, 
  Database, 
  ShieldCheck, 
  Sparkles, 
  Server, 
  Plus, 
  Layers, 
  CheckCircle2, 
  Send,
  Terminal,
  Cpu
} from 'lucide-react';

export const DeveloperDocs = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'architecture', 'api', 'ai', 'notes'
  
  // Future Notes State
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Decentralized Blockchain Verifier Anchor',
      author: 'Core Engineering',
      date: '2026-09-20',
      tag: 'Security / Web3',
      content: 'Anchor SHA-256 certificate hashes on Ethereum / Polygon smart contracts for immutable public validation without database dependency.'
    },
    {
      id: 2,
      title: 'Automated QR Code Holographic Watermarking',
      author: 'AI Agent Team',
      date: '2026-09-20',
      tag: 'Document Engine',
      content: 'Generate verifiable cryptographic QR codes dynamically embedded into downloaded PDF certificates with instant mobile camera scanning.'
    },
    {
      id: 3,
      title: 'DigiLocker & National Academic Depository (NAD) Sync',
      author: 'Gov Integration Team',
      date: '2026-09-20',
      tag: 'Integrations',
      content: 'Direct API bi-directional synchronization with National Academic Depository (NAD) and DigiLocker APIs for government passport/visa verification.'
    }
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('Feature Roadmap');
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteTitle || !newNoteContent) return;

    setNotes(prev => [
      {
        id: Date.now(),
        title: newNoteTitle,
        author: 'Developer / Contributor',
        date: new Date().toISOString().split('T')[0],
        tag: newNoteTag,
        content: newNoteContent
      },
      ...prev
    ]);

    setNewNoteTitle('');
    setNewNoteContent('');
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #06b6d4, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <BookOpen size={20} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              System Documentation & Developer Portal
            </h2>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Comprehensive architectural specs, API reference, AI verification protocols, and future enhancements roadmap
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--border-glass)', paddingBottom: 12 }}>
        {[
          { key: 'overview', label: 'Overview & Mission', icon: BookOpen },
          { key: 'architecture', label: 'Full-Stack Architecture', icon: Layers },
          { key: 'api', label: 'REST API Reference', icon: Server },
          { key: 'ai', label: 'AI Verification Engine', icon: Sparkles },
          { key: 'notes', label: 'Developer Notes & Roadmap', icon: Code2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.84rem',
                fontWeight: 600,
                background: isActive ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#1e293b',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid #60a5fa' : '1px solid #334155'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>
            1. Problem Statement & Mission
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.92rem' }}>
            Academic certificates (Degree, Marksheets, Transfer Certificates) are essential for job placements, internships, higher education admissions, visa applications, and government background checks. However, students frequently face delays when required to travel physically to institutions to obtain attested copies, and employers struggle with forged certificates.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={{ padding: '18px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: 6 }}>For Students:</div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Instant, 24/7 digital access to authorized, institutionally attested certificates without physical dependency on campus visits.</p>
            </div>
            <div style={{ padding: '18px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <div style={{ fontWeight: 700, color: '#34d399', marginBottom: 6 }}>For Colleges:</div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Centralized digital archive with AI OCR assistance to quickly verify scans, process retrieval requests, and track physical certificates.</p>
            </div>
            <div style={{ padding: '18px', borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>For Super Admins:</div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Platform-wide institutional vetting, issuing the exclusive "✓ Verified College" accreditation badge, and tamper-proof audit trails.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Architecture */}
      {activeTab === 'architecture' && (
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>
            2. Full-Stack Layered Architecture
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
            Built using a strict 3-tier architecture with separation of concerns:
          </p>
          <div style={{ background: '#090d16', padding: '18px', borderRadius: 12, border: '1px solid #1e293b', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#93c5fd', lineHeight: 1.7 }}>
            <div>Client (React 18 + Vite SPA) ──▶ REST API (Express.js)</div>
            <div>&nbsp;&nbsp;├── Auth Middleware (JWT & bcryptjs)</div>
            <div>&nbsp;&nbsp;├── RBAC Guard (STUDENT / COLLEGE_ADMIN / SUPER_ADMIN)</div>
            <div>&nbsp;&nbsp;├── Controllers (Clean request/response orchestration)</div>
            <div>&nbsp;&nbsp;├── Services (Business logic & Audit Logger)</div>
            <div>&nbsp;&nbsp;├── AI Engine (OCR Entity Extraction & Anomaly Detector)</div>
            <div>&nbsp;&nbsp;└── Relational DB Store (ACID Persistence & MySQL Compatibility)</div>
          </div>
        </div>
      )}

      {/* Tab 3: REST API */}
      {activeTab === 'api' && (
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>
            3. REST API Endpoint Specifications
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Method</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Endpoint</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Access Role</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { m: 'POST', ep: '/api/auth/login', r: 'Public', d: 'Authenticate user and issue JWT session token' },
                  { m: 'POST', ep: '/api/auth/register', r: 'Public', d: 'Register student profile affiliated with college' },
                  { m: 'GET', ep: '/api/students/profile', r: 'STUDENT', d: 'Get own student profile details' },
                  { m: 'PUT', ep: '/api/students/:id', r: 'STUDENT / ADMIN', d: 'Update student profile (enforces safe fields for students)' },
                  { m: 'GET', ep: '/api/documents', r: 'STUDENT / ADMIN', d: 'List certificates isolated by student/college role' },
                  { m: 'POST', ep: '/api/documents/upload', r: 'COLLEGE_ADMIN', d: 'Upload certificate and execute AI OCR verification' },
                  { m: 'POST', ep: '/api/documents/:id/physical-issue', r: 'COLLEGE_ADMIN', d: 'Log temporary physical certificate issuance/return' },
                  { m: 'POST', ep: '/api/verification/scan', r: 'COLLEGE_ADMIN', d: 'Run AI OCR analysis and database cross-referencing' },
                  { m: 'PATCH', ep: '/api/colleges/:id/verify', r: 'SUPER_ADMIN', d: 'Grant or revoke official "✓ Verified College" badge' },
                  { m: 'POST', ep: '/api/ai/chat', r: 'ALL', d: 'Process natural language query with deep-link navigation actions' }
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: row.m === 'POST' ? '#34d399' : (row.m === 'PATCH' || row.m === 'PUT' ? '#fbbf24' : '#60a5fa') }}>
                      {row.m}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                      {row.ep}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                      {row.r}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      {row.d}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: AI Engine */}
      {activeTab === 'ai' && (
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>
            4. AI Document Verification & Navigation Agent
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div style={{ padding: '20px', borderRadius: 12, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <h4 style={{ color: '#c084fc', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} />
                <span>6-Step AI Verification Pipeline</span>
              </h4>
              <ol style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', paddingLeft: 18, lineHeight: 1.6 }}>
                <li>OCR textual scan extraction</li>
                <li>Key entity extraction (Name, Roll, Degree, College)</li>
                <li>Database cross-referencing against authorized student record</li>
                <li>Discrepancy & anomaly detection (spelling variance, tampering)</li>
                <li>Confidence scoring (0-100%) & 🟢/🟡/🔴 verdict classification</li>
                <li>Human-in-the-loop recommendation for College Admin authorization</li>
              </ol>
            </div>

            <div style={{ padding: '20px', borderRadius: 12, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <h4 style={{ color: '#60a5fa', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} />
                <span>DocumentAssist AI Chatbot</span>
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Interactive assistant supporting pre-configured suggested chips, NLP query answering, role authorization checks, and direct deep-linking action buttons (e.g. <em>“Go to My Documents”</em>, <em>“Submit Document Request”</em>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Developer Notes & Future Roadmap */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Add Note Form */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={18} className="text-cyan-400" />
              <span>Record Future Enhancement / Note</span>
            </h3>

            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <input
                  type="text"
                  required
                  placeholder="Feature title / Enhancement idea..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="input-field"
                />
                <select
                  value={newNoteTag}
                  onChange={(e) => setNewNoteTag(e.target.value)}
                  className="input-field"
                >
                  <option value="Feature Roadmap">Feature Roadmap</option>
                  <option value="Security / Web3">Security / Web3</option>
                  <option value="AI Enhancement">AI Enhancement</option>
                  <option value="Gov Integration">Gov Integration</option>
                  <option value="Mobile App">Mobile App</option>
                </select>
              </div>

              <textarea
                rows={2}
                required
                placeholder="Technical details, architectural implications, or dependencies..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="input-field"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
                  <Plus size={14} />
                  <span>Add Developer Note</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notes List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {notes.map((n) => (
              <div key={n.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(6,182,212,0.15)', color: '#22d3ee', fontWeight: 700 }}>
                      {n.tag}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{n.date}</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                    {n.title}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {n.content}
                  </p>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: 8 }}>
                  Recorded by: <strong>{n.author}</strong>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
