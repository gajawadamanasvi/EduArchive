import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { AIVerificationModal } from '../../components/AIVerificationModal.jsx';
import { 
  FilePlus, 
  UploadCloud, 
  Sparkles, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  ArrowRight,
  FileText
} from 'lucide-react';

export const CollegeUpload = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [documentType, setDocumentType] = useState('Degree Certificate');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [isOriginal, setIsOriginal] = useState(false);
  const [lockerReference, setLockerReference] = useState('');
  const [sampleScenario, setSampleScenario] = useState('consistent'); // 'consistent', 'needs_review', 'mismatch'
  const [uploading, setUploading] = useState(false);
  const [uploadedResult, setUploadedResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await api.getCollegeStudents();
        if (data.success && data.students?.length > 0) {
          setStudents(data.students);
          setSelectedStudentId(data.students[0].id);
          setTitle(`Degree Certificate - ${data.students[0].user?.name}`);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      }
    };
    loadStudents();
  }, []);

  const handleStudentChange = (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    const stu = students.find(s => String(s.id) === String(sId));
    if (stu) {
      setTitle(`${documentType} - ${stu.user?.name}`);
    }
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setDocumentType(type);
    const stu = students.find(s => String(s.id) === String(selectedStudentId));
    if (stu) {
      setTitle(`${type} - ${stu.user?.name}`);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError('Please select an enrolled student.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('student_id', selectedStudentId);
    formData.append('document_type', documentType);
    formData.append('title', title);
    formData.append('is_original', isOriginal ? 'true' : 'false');
    formData.append('locker_reference', lockerReference || '');
    formData.append('run_ai_verification', 'true');

    if (file) {
      formData.append('file', file);
    } else {
      // Use sample scenario flag in synthetic filename for demonstration
      const simulatedName = `${documentType.replace(/\s+/g, '_')}_${sampleScenario}_scan.pdf`;
      formData.append('sample_name', simulatedName);
    }

    try {
      const data = await api.uploadDocument(formData);
      if (data.success) {
        setUploadedResult(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload and scan document.');
    } finally {
      setUploading(false);
    }
  };

  const selectedStudent = students.find(s => String(s.id) === String(selectedStudentId));

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
          Upload & Verify Student Certificate
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Scan physical certificates and trigger real-time AI OCR extraction and database cross-checking
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: '0.86rem' }}>
          {error}
        </div>
      )}

      {!uploadedResult ? (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          
          {/* Left Panel: Student & Document Meta */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Certificate Details
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Select Enrolled Student
              </label>
              <select
                value={selectedStudentId}
                onChange={handleStudentChange}
                className="input-field"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id} style={{ background: '#0f172a' }}>
                    {s.user?.name} (Roll: {s.roll_number})
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div style={{ padding: '12px', borderRadius: 8, background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div><strong>Program:</strong> {selectedStudent.course}</div>
                <div><strong>Student ID:</strong> {selectedStudent.student_id_number}</div>
                <div><strong>Email:</strong> {selectedStudent.user?.email}</div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Certificate Type
              </label>
              <select
                value={documentType}
                onChange={handleTypeChange}
                className="input-field"
              >
                <option value="Degree Certificate">Degree Certificate</option>
                <option value="10th Certificate">10th Certificate</option>
                <option value="12th Certificate">12th Certificate</option>
                <option value="Marksheet">Marksheet / Transcript</option>
                <option value="Transfer Certificate">Transfer Certificate</option>
                <option value="Provisional Certificate">Provisional Certificate</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Official Certificate Display Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Original Physical Certificate Deposit Toggle */}
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="origUploadCheck"
                  checked={isOriginal}
                  onChange={(e) => setIsOriginal(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#f59e0b', cursor: 'pointer' }}
                />
                <label htmlFor="origUploadCheck" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fbbf24', cursor: 'pointer' }}>
                  Original Physical Certificate Deposited in College Repository
                </label>
              </div>

              {isOriginal && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Locker / Safe Vault Shelf Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Locker Room A / Shelf 4 / Box 12"
                    value={lockerReference}
                    onChange={(e) => setLockerReference(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: File Upload & AI Simulation Scenarios */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 18 }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>
                Scan Upload & AI Verification
              </h3>

              {/* Drag & Drop Box */}
              <div style={{
                border: '2px dashed #334155',
                borderRadius: 12,
                padding: '28px 16px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.6)',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                />
                <UploadCloud size={38} className="text-blue-400" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                  {file ? file.name : 'Drag & drop certificate scan, or browse'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  PDF, PNG, JPG up to 15MB
                </div>
              </div>

              {/* Sample AI Test Mode Selection */}
              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                  Demo AI Test Scenarios
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setSampleScenario('consistent')}
                    style={{
                      padding: '8px',
                      borderRadius: 8,
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      background: sampleScenario === 'consistent' ? 'rgba(16,185,129,0.2)' : '#1e293b',
                      border: sampleScenario === 'consistent' ? '1px solid #10b981' : '1px solid #334155',
                      color: sampleScenario === 'consistent' ? '#34d399' : '#94a3b8'
                    }}
                  >
                    🟢 Clean Match
                  </button>
                  <button
                    type="button"
                    onClick={() => setSampleScenario('needs_review')}
                    style={{
                      padding: '8px',
                      borderRadius: 8,
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      background: sampleScenario === 'needs_review' ? 'rgba(245,158,11,0.2)' : '#1e293b',
                      border: sampleScenario === 'needs_review' ? '1px solid #f59e0b' : '1px solid #334155',
                      color: sampleScenario === 'needs_review' ? '#fbbf24' : '#94a3b8'
                    }}
                  >
                    🟡 Needs Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setSampleScenario('mismatch')}
                    style={{
                      padding: '8px',
                      borderRadius: 8,
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      background: sampleScenario === 'mismatch' ? 'rgba(244,63,94,0.2)' : '#1e293b',
                      border: sampleScenario === 'mismatch' ? '1px solid #f43f5e' : '1px solid #334155',
                      color: sampleScenario === 'mismatch' ? '#fb7185' : '#94a3b8'
                    }}
                  >
                    🔴 Suspicious
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
            >
              <Sparkles size={18} />
              <span>{uploading ? 'Processing AI OCR Verification Scan...' : 'Upload & Execute AI Verification'}</span>
            </button>
          </div>

        </form>
      ) : (
        /* Upload Success & AI Scan Preview */
        <div className="glass-panel animate-fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 20, border: '1px solid rgba(139, 92, 246, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Certificate Uploaded & AI Verification Complete!
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {uploadedResult.document?.title} has been archived in the repository.
              </p>
            </div>
          </div>

          {/* AI Result Card */}
          {uploadedResult.aiResult && (
            <div style={{
              padding: '18px',
              borderRadius: 12,
              background: uploadedResult.aiResult.classification === 'CONSISTENT' ? 'rgba(16,185,129,0.08)' : (uploadedResult.aiResult.classification === 'SUSPICIOUS_MISMATCH' ? 'rgba(244,63,94,0.08)' : 'rgba(245,158,11,0.08)'),
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                  AI Verification Result: {uploadedResult.aiResult.classification} ({uploadedResult.aiResult.confidenceScore}%)
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                {uploadedResult.aiResult.recommendation}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--border-glass)', paddingTop: 18 }}>
            <button
              onClick={() => {
                setUploadedResult(null);
                setFile(null);
              }}
              className="btn-secondary"
            >
              Upload Another Document
            </button>
            <button
              onClick={() => navigate('/college/documents')}
              className="btn-primary"
            >
              <span>View in Repository</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
