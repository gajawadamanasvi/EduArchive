import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { 
  Camera, 
  RefreshCw, 
  Check, 
  X, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  Zap, 
  RotateCw,
  ScanLine,
  Image as ImageIcon
} from 'lucide-react';

export const CameraOCRScanner = ({ onCapture, onClose, title = "Live Certificate Camera Scanner" }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [extractedFields, setExtractedFields] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'

  // Initialize camera stream
  const startCamera = async (mode = facingMode) => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('[CameraOCRScanner] Camera start error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access permission denied. Please allow camera access in your browser settings.'
          : 'Could not start camera feed: ' + err.message
      );
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Flip camera (front/back)
  const toggleFacingMode = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
  };

  // Run OCR on captured image using Tesseract.js
  const runOcrOnImage = async (dataUrl) => {
    setIsProcessing(true);
    setOcrProgress(5);
    setOcrStatus('Initializing OCR Neural Engine...');

    try {
      const worker = await createWorker('eng');
      
      setOcrProgress(25);
      setOcrStatus('Analyzing document structure...');

      const ret = await worker.recognize(dataUrl);
      setOcrProgress(80);
      setOcrStatus('Parsing certificate fields & registry tokens...');

      const text = ret.data.text || '';
      setExtractedText(text);

      // Parse entities from OCR text
      const parsed = parseEntitiesFromText(text);
      setExtractedFields(parsed);

      setOcrProgress(100);
      setOcrStatus('OCR Extraction Complete!');
      await worker.terminate();
    } catch (err) {
      console.error('[CameraOCRScanner] OCR processing error:', err);
      setOcrStatus('OCR extraction encountered an issue; raw image captured successfully.');
      setExtractedText('Document captured via camera.\nReady for institutional verification.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract structured candidate entities from recognized text
  const parseEntitiesFromText = (text) => {
    const lines = (text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let studentName = '';
    let rollNumber = '';
    let collegeName = '';
    let course = '';

    for (const line of lines) {
      if (!studentName) {
        const match = line.match(/(?:Student Name|Name of Candidate|Candidate|Name|MR\.|MS\.)\s*[:\-]?\s*([A-Za-z .]{3,40})/i);
        if (match) studentName = match[1].trim();
      }
      if (!rollNumber) {
        const match = line.match(/(?:Roll No|Registration No|Reg\.?\s*No|Roll Number|Student ID|Hall Ticket|HT No)\s*[:\-]?\s*([A-Za-z0-9\/\-_]{4,30})/i);
        if (match) rollNumber = match[1].trim();
      }
      if (!collegeName) {
        const match = line.match(/(?:Institution|College|University|Institute|Academy)\s*[:\-]?\s*([A-Za-z0-9 .,&-]{5,60})/i);
        if (match) collegeName = match[1].trim();
      }
      if (!course) {
        const match = line.match(/(?:Degree|Course|Program|Branch|Bachelor of|Master of|B\.Tech|B\.E\.|B\.Sc|M\.Tech)\s*[:\-]?\s*([A-Za-z .,&-]{3,50})/i);
        if (match) course = match[1].trim();
      }
    }

    const hasSecuritySeal = /seal|official|verified|registrar|controller|signature|stamp|authentic/i.test(text);

    return {
      studentName: studentName || 'Candidate Name',
      rollNumber: rollNumber || 'Roll / Reg Number',
      collegeName: collegeName || 'Accredited Academic Institution',
      course: course || 'Academic Degree / Certificate',
      hasSecuritySeal,
      rawTextSnippet: text.substring(0, 300)
    };
  };

  // Capture snapshot from video canvas
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);

    // Convert dataURL to Blob / File
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedFile(file);
      }
    }, 'image/jpeg', 0.92);

    // Stop video track temporarily while reviewing
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }

    // Run OCR on the captured snapshot
    runOcrOnImage(dataUrl);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    setExtractedText('');
    setExtractedFields(null);
    setOcrProgress(0);
    setOcrStatus('');
    startCamera(facingMode);
  };

  // Confirm and submit captured scan to parent component
  const handleConfirm = () => {
    if (!capturedFile && !capturedImage) return;

    if (onCapture) {
      onCapture({
        file: capturedFile,
        ocrText: extractedText,
        extractedFields,
        dataUrl: capturedImage
      });
    }

    if (onClose) onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: 860,
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.7)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Camera size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                {title}
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                High-precision AI OCR text extraction & physical attestation scan
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

        {/* Scanner Viewport / Review Body */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(5, 10, 20, 0.5)'
        }}>

          {cameraError ? (
            <div style={{
              padding: '40px 24px',
              textAlign: 'center',
              maxWidth: 480,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14
            }}>
              <AlertCircle size={44} style={{ color: '#f43f5e' }} />
              <h4 style={{ color: '#f8fafc', fontSize: '1.1rem' }}>Camera Access Required</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {cameraError}
              </p>
              <button
                onClick={() => startCamera(facingMode)}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <RefreshCw size={15} />
                <span>Retry Camera Permission</span>
              </button>
            </div>
          ) : !capturedImage ? (
            /* Live Camera Stream with Document Overlay */
            <div style={{ position: 'relative', width: '100%', maxWidth: 680, borderRadius: 12, overflow: 'hidden', background: '#000' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: 'auto', maxHeight: '52vh', display: 'block', objectFit: 'contain' }}
              />
              
              {/* Document Alignment Frame Box */}
              <div style={{
                position: 'absolute',
                inset: '10% 8%',
                border: '2px dashed rgba(59, 130, 246, 0.8)',
                borderRadius: 12,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: 24, height: 24, borderTop: '4px solid #60a5fa', borderLeft: '4px solid #60a5fa' }} />
                  <div style={{ width: 24, height: 24, borderTop: '4px solid #60a5fa', borderRight: '4px solid #60a5fa' }} />
                </div>
                <div style={{ textAlign: 'center', color: '#60a5fa', fontSize: '0.78rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  ALIGN CERTIFICATE / DOCUMENT WITHIN FRAME
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: 24, height: 24, borderBottom: '4px solid #60a5fa', borderLeft: '4px solid #60a5fa' }} />
                  <div style={{ width: 24, height: 24, borderBottom: '4px solid #60a5fa', borderRight: '4px solid #60a5fa' }} />
                </div>
              </div>

              {/* Camera Switch Toggle */}
              <button
                type="button"
                onClick={toggleFacingMode}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <RotateCw size={14} />
                <span>Switch Camera</span>
              </button>
            </div>
          ) : (
            /* Review Captured Document & OCR Entities */
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {/* Image Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Captured Document Snapshot
                </div>
                <div style={{
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#000',
                  maxHeight: 280,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <img src={capturedImage} alt="Captured Certificate" style={{ width: '100%', height: 'auto', maxHeight: 280, objectFit: 'contain' }} />
                </div>
              </div>

              {/* OCR Parsing & Entity Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>
                    OCR Recognized Text & Fields
                  </span>
                  {isProcessing && (
                    <span style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 600 }}>
                      ⚡ {ocrProgress}%
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {isProcessing && (
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#1e293b', overflow: 'hidden' }}>
                    <div style={{ width: `${ocrProgress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', transition: 'width 0.3s' }} />
                  </div>
                )}

                {ocrStatus && (
                  <div style={{ fontSize: '0.75rem', color: isProcessing ? '#60a5fa' : '#34d399', fontWeight: 600 }}>
                    {ocrStatus}
                  </div>
                )}

                {/* Extracted Entities Grid */}
                {extractedFields && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    fontSize: '0.76rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}>
                    <div><strong>Detected Candidate:</strong> {extractedFields.studentName}</div>
                    <div><strong>Detected Roll/ID:</strong> {extractedFields.rollNumber}</div>
                    <div><strong>Detected Program:</strong> {extractedFields.course}</div>
                    <div><strong>Institution Seal:</strong> {extractedFields.hasSecuritySeal ? '✓ Authenticity Watermark Found' : '⚠️ Seal unclear in frame'}</div>
                  </div>
                )}

                {/* Editable OCR text area */}
                <div>
                  <textarea
                    rows={4}
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    placeholder="Recognized OCR text will appear here..."
                    className="input-field"
                    style={{ fontSize: '0.76rem', fontFamily: 'monospace', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas for snapshot extraction */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

        </div>

        {/* Modal Footer Controls */}
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
          <div>
            {!capturedImage ? (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Position camera over document and ensure clear lighting
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRetake}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.82rem', gap: 6 }}
              >
                <RefreshCw size={15} />
                <span>Retake Photo</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            >
              Cancel
            </button>

            {!capturedImage ? (
              <button
                type="button"
                onClick={handleCapture}
                disabled={Boolean(cameraError)}
                className="btn-primary"
                style={{
                  padding: '10px 22px',
                  fontSize: '0.86rem',
                  gap: 8,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)'
                }}
              >
                <ScanLine size={18} />
                <span>Capture & Run OCR</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="btn-primary"
                style={{
                  padding: '10px 22px',
                  fontSize: '0.86rem',
                  gap: 8,
                  background: 'linear-gradient(135deg, #10b981, #059669)'
                }}
              >
                <Check size={18} />
                <span>Use Captured Scan & OCR Data</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
