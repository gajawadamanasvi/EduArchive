import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { StatusBadge } from './StatusBadge.jsx';
import { 
  X, 
  Download, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  User, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export const CertificateViewerModal = ({ document, onClose }) => {
  const [svgContent, setSvgContent] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [imageBlobUrl, setImageBlobUrl] = useState(null);
  const [contentType, setContentType] = useState('svg');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const docId = document?.id || document?.document_id;
  const token = api.getToken();

  useEffect(() => {
    if (!docId) return;

    let isMounted = true;
    let createdBlobUrl = null;

    const fetchCertificateView = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/documents/${docId}/view`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!res.ok) {
          throw new Error('Could not load certificate preview');
        }

        const mime = res.headers.get('content-type') || '';
        
        if (mime.includes('application/pdf')) {
          const blob = await res.blob();
          createdBlobUrl = URL.createObjectURL(blob);
          if (isMounted) {
            setContentType('pdf');
            setPdfBlobUrl(createdBlobUrl);
          }
        } else if (mime.includes('image/png') || mime.includes('image/jpeg') || mime.includes('image/jpg')) {
          const blob = await res.blob();
          createdBlobUrl = URL.createObjectURL(blob);
          if (isMounted) {
            setContentType('image');
            setImageBlobUrl(createdBlobUrl);
          }
        } else {
          // Assume SVG/XML
          const text = await res.text();
          if (isMounted) {
            setContentType('svg');
            setSvgContent(text);
          }
        }
      } catch (err) {
        console.error('[CertificateViewerModal] View Error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to render certificate.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCertificateView();

    return () => {
      isMounted = false;
      if (createdBlobUrl) {
        URL.revokeObjectURL(createdBlobUrl);
      }
    };
  }, [docId, token]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await api.downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      
      let ext = '.svg';
      if (blob.type && blob.type.includes('pdf')) ext = '.pdf';
      else if (blob.type && blob.type.includes('png')) ext = '.png';
      else if (blob.type && (blob.type.includes('jpeg') || blob.type.includes('jpg'))) ext = '.jpg';
      
      const cleanTitle = (document.document_type || document.title || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_');
      const roll = document.student?.roll_number ? `_${document.student.roll_number}` : '';
      a.download = `${cleanTitle}${roll}_Official${ext}`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('Download error: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (contentType === 'pdf' && pdfBlobUrl) {
      const printWindow = window.open(pdfBlobUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      }
      return;
    }

    if (svgContent) {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print the certificate.');
        return;
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${document.title || 'Official Academic Certificate'}</title>
            <style>
              body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; background: #fff; }
              svg { width: 100%; max-width: 900px; height: auto; }
              @media print {
                body { padding: 0; }
                @page { size: landscape; margin: 0.5cm; }
              }
            </style>
          </head>
          <body>
            ${svgContent}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleOpenNewTab = () => {
    const viewUrl = `/api/documents/${docId}/view?token=${encodeURIComponent(token || '')}`;
    window.open(viewUrl, '_blank');
  };

  if (!document) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: 960,
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  {document.title || document.document_type || 'Academic Certificate'}
                </h3>
                <StatusBadge status={document.status || 'VERIFIED'} isOriginal={document.is_original} />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {document.college?.name || 'Accredited Academic Institution'} • Verified Digital Attestation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="hover:text-white"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: 8,
              padding: 6,
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Display Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          background: 'rgba(5, 10, 20, 0.4)'
        }}>
          
          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock size={36} style={{ margin: '0 auto 12px', opacity: 0.6 }} className="animate-spin" />
              <p>Rendering digital certificate watermark and cryptographic seal...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#f87171' }}>
              <p>{error}</p>
            </div>
          ) : contentType === 'pdf' && pdfBlobUrl ? (
            <div style={{
              width: '100%',
              maxWidth: 820,
              height: 520,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 20px 35px -10px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#ffffff'
            }}>
              <iframe
                src={pdfBlobUrl}
                title="PDF Certificate"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          ) : contentType === 'image' && imageBlobUrl ? (
            <div style={{
              width: '100%',
              maxWidth: 820,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 20px 35px -10px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#ffffff',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <img src={imageBlobUrl} alt="Certificate" style={{ maxWidth: '100%', maxHeight: 520, objectFit: 'contain' }} />
            </div>
          ) : (
            <div 
              style={{
                width: '100%',
                maxWidth: 820,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 20px 35px -10px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'center'
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}

          {/* Quick Details Strip */}
          <div style={{
            width: '100%',
            maxWidth: 820,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            padding: '14px 18px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-glass)',
            fontSize: '0.82rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>STUDENT</span>
              <strong style={{ color: '#f8fafc' }}>{document.student?.name || 'Student'}</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Roll: {document.student?.roll_number || 'N/A'}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>DOCUMENT TYPE</span>
              <strong style={{ color: '#60a5fa' }}>{document.document_type}</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Original Vault Copy</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>ISSUING INSTITUTION</span>
              <strong style={{ color: '#f8fafc' }}>{document.college?.name || 'Academic Institution'}</strong>
              <div style={{ color: '#34d399', fontSize: '0.75rem' }}>State Authorized Repository</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>AUTHENTICATION</span>
              <strong style={{ color: '#34d399' }}>Digitally Certified</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ID: {docId}</div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          background: 'rgba(15, 23, 42, 0.7)'
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleOpenNewTab}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem', gap: 6 }}
            >
              <ExternalLink size={15} />
              <span>Open in New Tab</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={loading || (!svgContent && !pdfBlobUrl)}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem', gap: 6 }}
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.84rem', gap: 6 }}
            >
              <Download size={16} />
              <span>{downloading ? 'Downloading...' : 'Download Certificate'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
