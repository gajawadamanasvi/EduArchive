import React, { useState } from 'react';
import { X, Send, FilePlus, AlertCircle, Sparkles, UploadCloud, FileText, Image as ImageIcon, Camera } from 'lucide-react';
import { api } from '../services/api.js';
import { CameraOCRScanner } from './CameraOCRScanner.jsx';

export const DocumentRequestModal = ({ onClose, onRequestCreated }) => {
  const [docType, setDocType] = useState('Degree Certificate');
  const [customType, setCustomType] = useState('');
  const [reason, setReason] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [file, setFile] = useState(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const documentTypes = [
    'Degree Certificate',
    '10th Certificate',
    '12th Certificate / Intermediate',
    'Consolidated Marksheet / Transcript',
    'Transfer / Migration Certificate',
    'Provisional Certificate',
    'Bonafide / Character Certificate',
    'Other'
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCameraCapture = ({ file: capturedFile, ocrText, extractedFields }) => {
    if (capturedFile) {
      setFile(capturedFile);
    }
    if (extractedFields?.documentType && extractedFields.documentType !== 'Official Degree Certificate') {
      const matchedType = documentTypes.find(t => t.toLowerCase().includes(extractedFields.documentType.toLowerCase()));
      if (matchedType) {
        setDocType(matchedType);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalType = docType === 'Other' ? customType : docType;
    if (!finalType) {
      setError('Please specify the certificate type requested.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('document_type', finalType);
      formData.append('reason', reason);
      formData.append('urgent', urgent ? 'true' : 'false');
      if (file) {
        formData.append('file', file);
      }

      await api.createDocumentRequest(formData);
      if (onRequestCreated) onRequestCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit document request.');
    } finally {
      setLoading(false);
    }
  };

  const isPdf = file?.type?.includes('pdf') || file?.name?.toLowerCase().endsWith('.pdf');
  const isImage = file?.type?.includes('image') || /\.(png|jpg|jpeg|webp)$/i.test(file?.name || '');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: 540,
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        border: '1px solid rgba(59, 130, 246, 0.4)'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <FilePlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Request Certificate / Document
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Official institutional retrieval & attestation request
              </div>
            </div>
          </div>

          <button onClick={onClose} className="hover:text-white" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Select Certificate Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="input-field"
            >
              {documentTypes.map((t) => (
                <option key={t} value={t} style={{ background: '#0f172a' }}>{t}</option>
              ))}
            </select>
          </div>

          {docType === 'Other' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Specify Certificate Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Medium of Instruction Certificate"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          {/* Optional File Attachment (PDF / Image) & Live Camera Scan */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Attach Certificate Copy / Scan <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCameraScanner(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Camera size={13} />
                <span>Live Camera Scan</span>
              </button>
            </div>
            
            <div style={{
              border: '2px dashed #334155',
              borderRadius: 10,
              padding: '16px 14px',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.5)',
              position: 'relative',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
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
              
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isPdf ? <FileText size={22} className="text-red-400" /> : <ImageIcon size={22} className="text-emerald-400" />}
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: 4, background: isPdf ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: isPdf ? '#f87171' : '#34d399', fontWeight: 700 }}>
                    {isPdf ? 'PDF File' : 'Image File'}
                  </span>
                </div>
              ) : (
                <div>
                  <UploadCloud size={24} className="text-blue-400" style={{ margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                    Click or drag & drop to attach PDF or PNG/JPG scan
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Purpose / Reason for Retrieval
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Required for Higher Education application / Employment background verification..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
            <input
              type="checkbox"
              id="urgentCheck"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#3b82f6', cursor: 'pointer' }}
            />
            <label htmlFor="urgentCheck" style={{ fontSize: '0.82rem', color: '#f8fafc', cursor: 'pointer', fontWeight: 500 }}>
              Mark as <span style={{ color: '#fbbf24', fontWeight: 700 }}>Urgent Requirement</span> (Express Processing)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Send size={16} />
              <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>

        </form>
      </div>

      {showCameraScanner && (
        <CameraOCRScanner
          onCapture={handleCameraCapture}
          onClose={() => setShowCameraScanner(false)}
        />
      )}
    </div>
  );
};
