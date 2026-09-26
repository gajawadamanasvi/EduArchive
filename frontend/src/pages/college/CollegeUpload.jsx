import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api.js';
import { AIVerificationModal } from '../../components/AIVerificationModal.jsx';
import { CertificateViewerModal } from '../../components/CertificateViewerModal.jsx';
import { CameraOCRScanner } from '../../components/CameraOCRScanner.jsx';
import { 
  FilePlus, 
  UploadCloud, 
  Sparkles, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  FileText,
  Camera,
  ScanLine,
  Eye,
  Layers,
  XCircle
} from 'lucide-react';

export const CollegeUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedStudentId = queryParams.get('studentId');

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId || '');
  const [documentType, setDocumentType] = useState('Degree Certificate');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [isOriginal, setIsOriginal] = useState(false);
  const [lockerReference, setLockerReference] = useState('');
  const [sampleScenario, setSampleScenario] = useState('consistent'); // 'consistent', 'needs_review', 'mismatch'
  const [uploading, setUploading] = useState(false);
  const [uploadedResult, setUploadedResult] = useState(null);
  const [selectedViewDoc, setSelectedViewDoc] = useState(null);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [customOcrText, setCustomOcrText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await api.getCollegeStudents();
        if (data.success && data.students?.length > 0) {
          setStudents(data.students);
          const initialId = preselectedStudentId && data.students.some(s => String(s.id) === String(preselectedStudentId))
            ? preselectedStudentId
            : data.students[0].id;
          
          setSelectedStudentId(initialId);
          const initialStu = data.students.find(s => String(s.id) === String(initialId));
          if (initialStu) {
            setTitle(`Degree Certificate - ${initialStu.user?.name || initialStu.name}`);
          }
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      }
    };
    loadStudents();
  }, [preselectedStudentId]);

  const handleStudentChange = (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    const stu = students.find(s => String(s.id) === String(sId));
    if (stu) {
      setTitle(`${documentType} - ${stu.user?.name || stu.name}`);
    }
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setDocumentType(type);
    const stu = students.find(s => String(s.id) === String(selectedStudentId));
    if (stu) {
      setTitle(`${type} - ${stu.user?.name || stu.name}`);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCameraCapture = ({ file: capturedFile, ocrText, extractedFields }) => {
    if (capturedFile) {
      setFile(capturedFile);
    }
    if (ocrText) {
      setCustomOcrText(ocrText);
    }
    if (extractedFields) {
      if (extractedFields.studentName && extractedFields.studentName !== 'Candidate Name') {
        const matchingStu = students.find(s => 
          (s.roll_number && extractedFields.rollNumber && s.roll_number.toLowerCase() === extractedFields.rollNumber.toLowerCase()) ||
          (s.user?.name && s.user.name.toLowerCase().includes(extractedFields.studentName.toLowerCase()))
        );
        if (matchingStu) {
          setSelectedStudentId(matchingStu.id);
          setTitle(`${documentType} - ${matchingStu.user?.name || matchingStu.name}`);
        }
      }
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
    if (customOcrText) {
      formData.append('custom_ocr_text', customOcrText);
    }

    if (file) {
      formData.append('file', file);
    } else {
      // Use sample scenario flag in synthetic filename for demonstration
      const simulatedName = sampleScenario === 'mismatch'
        ? `${documentType.replace(/\s+/g, '_')}_mismatch_scan.pdf`
        : (sampleScenario === 'needs_review' ? `${documentType.replace(/\s+/g, '_')}_provisional_review.pdf` : `${documentType.replace(/\s+/g, '_')}_clean_match.pdf`);
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
          Scan physical certificates and trigger real-time LangGraph multi-agent OCR extraction and database cross-checking
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
                <div><strong>Roll Number:</strong> {selectedStudent.roll_number}</div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Document Type
              </label>
              <select
                value={documentType}
                onChange={handleTypeChange}
                className="input-field"
              >
                <option value="Degree Certificate">Degree Certificate</option>
                <option value="Provisional Certificate">Provisional Certificate</option>
                <option value="Marksheet / Transcript">Marksheet / Transcript</option>
                <option value="Transfer Certificate">Transfer Certificate (TC)</option>
                <option value="Bonafide Certificate">Bonafide Certificate</option>
                <option value="10th Secondary Certificate">10th Secondary Certificate</option>
                <option value="12th Higher Secondary Certificate">12th Higher Secondary Certificate</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Physical Custody Details */}
            <div style={{ padding: '14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="isOriginalCheck"
                  checked={isOriginal}
                  onChange={(e) => setIsOriginal(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#3b82f6', cursor: 'pointer' }}
                />
                <label htmlFor="isOriginalCheck" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc', cursor: 'pointer' }}>
                  Original Physical Hardcopy Deposited in Vault
                </label>
              </div>

              {isOriginal && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Vault / Locker Reference Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rack B, Cabinet 4, Binder 2024-CS"
                    value={lockerReference}
                    onChange={(e) => setLockerReference(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: File Upload & Camera OCR */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Certificate Source & AI Scanner
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {/* Camera Scanner Trigger */}
              <button
                type="button"
                onClick={() => setShowCameraScanner(true)}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.35)'
                }}
              >
                <Camera size={18} />
                <span>Open Live Camera (AI OCR Scanner)</span>
              </button>

              {/* Drag & Drop Box */}
              <div style={{
                border: '2px dashed #334155',
                borderRadius: 12,
                padding: '24px 16px',
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

              {customOcrText && (
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', fontSize: '0.78rem', color: '#c084fc' }}>
                  <strong>OCR Text Attached:</strong> {customOcrText.slice(0, 100)}...
                </div>
              )}

              {/* Sample AI Test Mode Selection */}
              <div style={{ marginTop: 8 }}>
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
              <span>{uploading ? 'Processing LangGraph AI Verification...' : 'Upload & Execute AI Verification'}</span>
            </button>
          </div>

        </form>
      ) : (
        /* Upload Success & AI Scan Preview */
        <div className="glass-panel animate-fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 20, border: '1px solid rgba(139, 92, 246, 0.4)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 44, 
              height: 44, 
              borderRadius: '50%', 
              background: uploadedResult.aiResult?.classification === 'SUSPICIOUS_MISMATCH' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
              color: uploadedResult.aiResult?.classification === 'SUSPICIOUS_MISMATCH' ? '#fb7185' : '#34d399', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {uploadedResult.aiResult?.classification === 'SUSPICIOUS_MISMATCH' ? <ShieldAlert size={26} /> : <CheckCircle2 size={26} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {uploadedResult.aiResult?.classification === 'SUSPICIOUS_MISMATCH' ? 'Certificate Uploaded • Verification Discrepancy Flagged' : 'Certificate Uploaded & AI Verification Complete!'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {uploadedResult.document?.title} has been archived in the repository under student {selectedStudent?.user?.name || selectedStudent?.name}.
              </p>
            </div>
          </div>

          {/* High-visibility Warning Banner for Mismatches */}
          {uploadedResult.aiResult?.classification === 'SUSPICIOUS_MISMATCH' && (
            <div style={{
              padding: '16px',
              borderRadius: 10,
              background: 'rgba(244, 63, 94, 0.15)',
              border: '2px solid rgba(244, 63, 94, 0.5)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}>
              <ShieldAlert size={24} style={{ color: '#fb7185', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 800, color: '#fb7185', fontSize: '0.96rem' }}>
                  ⚠️ IDENTITY MISMATCH DETECTED (Score: {uploadedResult.aiResult?.confidenceScore}%)
                </div>
                <div style={{ fontSize: '0.84rem', color: '#fecdd3', marginTop: 4 }}>
                  The candidate name on this uploaded certificate does NOT match registered student <strong>{selectedStudent?.user?.name}</strong>. The certificate has been flagged as <strong>NEEDS_REVIEW</strong> for administrator signoff.
                </div>
              </div>
            </div>
          )}

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
                  Verdict: {uploadedResult.aiResult.classification} ({uploadedResult.aiResult.confidenceScore}%)
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: uploadedResult.aiResult.classification === 'CONSISTENT' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)',
                  color: uploadedResult.aiResult.classification === 'CONSISTENT' ? '#34d399' : '#fb7185'
                }}>
                  {uploadedResult.aiResult.statusBadge}
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                {uploadedResult.aiResult.recommendation}
              </div>

              {/* Field Checks */}
              {uploadedResult.aiResult.fieldChecks?.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {uploadedResult.aiResult.fieldChecks.map((fc, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                      <span style={{ color: 'var(--text-primary)' }}>{fc.field}:</span>
                      <span style={{ color: fc.status === 'MATCH' ? '#34d399' : '#fb7185', fontWeight: 600 }}>
                        {fc.extracted} ({fc.status})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--border-glass)', paddingTop: 18, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setUploadedResult(null);
                setFile(null);
                setCustomOcrText('');
              }}
              className="btn-secondary"
            >
              Upload Another Document
            </button>
            {uploadedResult.document && (
              <button
                type="button"
                onClick={() => setShowInspectModal(true)}
                className="btn-secondary"
                style={{ borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c084fc', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Sparkles size={16} />
                <span>Full AI Inspector</span>
              </button>
            )}
            {uploadedResult.document && (
              <button
                type="button"
                onClick={() => setSelectedViewDoc(uploadedResult.document)}
                className="btn-secondary"
                style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}
              >
                <FileText size={16} />
                <span>Preview Certificate</span>
              </button>
            )}
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

      {selectedViewDoc && (
        <CertificateViewerModal
          document={selectedViewDoc}
          onClose={() => setSelectedViewDoc(null)}
        />
      )}

      {showInspectModal && uploadedResult?.document && (
        <AIVerificationModal
          document={uploadedResult.document}
          aiResult={uploadedResult.aiResult}
          onClose={() => setShowInspectModal(false)}
          onStatusUpdated={() => {}}
          isCollegeAdmin={true}
        />
      )}

      {showCameraScanner && (
        <CameraOCRScanner
          onCapture={handleCameraCapture}
          onClose={() => setShowCameraScanner(false)}
        />
      )}

    </div>
  );
};
