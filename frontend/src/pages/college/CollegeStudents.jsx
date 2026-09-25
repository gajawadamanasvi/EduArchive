import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  ShieldCheck, 
  Mail, 
  Phone, 
  GraduationCap, 
  X, 
  Check, 
  FilePlus, 
  Award, 
  UploadCloud, 
  Sparkles,
  Building2,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
  CheckCircle2,
  Hash,
  BookOpen
} from 'lucide-react';

export const CollegeStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEditStudent, setSelectedEditStudent] = useState(null);
  const [selectedAddDocStudent, setSelectedAddDocStudent] = useState(null);
  const [createdStudentCreds, setCreatedStudentCreds] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: 'StudentPass@123',
    roll_number: '',
    student_id_number: '',
    phone: '',
    course: 'Bachelor of Technology in Computer Science',
    department: 'Computer Science & Engineering',
    academic_year: '2022-2026'
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Add Document Form State
  const [docFormData, setDocFormData] = useState({
    document_type: 'Degree Certificate',
    title: '',
    is_original: true,
    locker_reference: 'College Archive Locker / Vault Bay 03',
    file: null
  });

  const [creating, setCreating] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [docSuccessMsg, setDocSuccessMsg] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getCollegeStudents();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('[CollegeStudents] Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setCreating(true);
    setModalError(null);
    try {
      const data = await api.createStudent(newStudent);
      if (data.success) {
        setCreatedStudentCreds({
          name: newStudent.name,
          email: newStudent.email,
          password: newStudent.password,
          roll_number: newStudent.roll_number,
          student_id_number: newStudent.student_id_number || `REG-${newStudent.roll_number}`
        });
        setShowAddModal(false);
        setNewStudent({
          name: '',
          email: '',
          password: 'StudentPass@123',
          roll_number: '',
          student_id_number: '',
          phone: '',
          course: 'Bachelor of Technology in Computer Science',
          department: 'Computer Science & Engineering',
          academic_year: '2022-2026'
        });
        fetchStudents();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to register student record.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!selectedEditStudent) return;
    setCreating(true);
    setModalError(null);
    try {
      const payload = {
        name: selectedEditStudent.user?.name,
        email: selectedEditStudent.user?.email,
        roll_number: selectedEditStudent.roll_number,
        student_id_number: selectedEditStudent.student_id_number,
        course: selectedEditStudent.course,
        department: selectedEditStudent.department,
        academic_year: selectedEditStudent.academic_year,
        phone: selectedEditStudent.phone
      };

      if (editPassword && editPassword.trim().length > 0) {
        payload.password = editPassword.trim();
      }

      const data = await api.updateStudentProfile(selectedEditStudent.id, payload);
      if (data.success) {
        setSelectedEditStudent(null);
        setEditPassword('');
        fetchStudents();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to update student profile.');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenAddDocModal = (student) => {
    setModalError(null);
    setDocSuccessMsg(null);
    setSelectedAddDocStudent(student);
    setDocFormData({
      document_type: 'Degree Certificate',
      title: `Degree Certificate - ${student.user?.name}`,
      is_original: true,
      locker_reference: 'College Archive Locker / Vault Bay 03',
      file: null
    });
  };

  const handleAddDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddDocStudent) return;
    setUploadingDoc(true);
    setModalError(null);

    const formData = new FormData();
    formData.append('student_id', selectedAddDocStudent.id);
    formData.append('document_type', docFormData.document_type);
    formData.append('title', docFormData.title || `${docFormData.document_type} - ${selectedAddDocStudent.user?.name}`);
    formData.append('is_original', docFormData.is_original ? 'true' : 'false');
    formData.append('custody_status', docFormData.is_original ? 'STORED_IN_COLLEGE_REPOSITORY' : 'NOT_APPLICABLE');
    formData.append('locker_reference', docFormData.locker_reference);
    formData.append('run_ai_verification', 'true');

    if (docFormData.file) {
      formData.append('file', docFormData.file);
    }

    try {
      const data = await api.uploadDocument(formData);
      if (data.success) {
        setDocSuccessMsg(`Original document "${docFormData.title}" successfully added & verified in repository.`);
        setTimeout(() => {
          setSelectedAddDocStudent(null);
          setDocSuccessMsg(null);
        }, 1500);
      }
    } catch (err) {
      setModalError(err.message || 'Failed to upload and register original document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const copyCredsToClipboard = () => {
    if (!createdStudentCreds) return;
    const text = `🎓 Student Portal Login Credentials\nName: ${createdStudentCreds.name}\nGmail/Email: ${createdStudentCreds.email}\nPassword: ${createdStudentCreds.password}\nRoll No: ${createdStudentCreds.roll_number}\nReg No: ${createdStudentCreds.student_id_number}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.user?.name && s.user.name.toLowerCase().includes(q)) ||
      (s.roll_number && s.roll_number.toLowerCase().includes(q)) ||
      (s.student_id_number && s.student_id_number.toLowerCase().includes(q)) ||
      (s.course && s.course.toLowerCase().includes(q)) ||
      (s.department && s.department.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.user?.email && s.user.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            Enrolled Student Directory
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Manage student academic profiles, configure login credentials & passwords, and register vault documents
          </p>
        </div>

        <button
          onClick={() => {
            setModalError(null);
            setShowAddModal(true);
          }}
          className="btn-primary"
          style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
        >
          <UserPlus size={16} />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Created Student Credentials Notification Modal */}
      {createdStudentCreds && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 500, padding: '28px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Student Enrolled Successfully!
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#34d399' }}>
                  Credentials have been saved and active for login
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: 10, padding: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student Name:</span>
                <strong style={{ color: '#ffffff' }}>{createdStudentCreds.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gmail / Email:</span>
                <strong style={{ color: '#60a5fa' }}>{createdStudentCreds.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Roll Number:</span>
                <strong style={{ color: '#38bdf8' }}>{createdStudentCreds.roll_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registration No:</span>
                <strong style={{ color: '#e2e8f0' }}>{createdStudentCreds.student_id_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Login Password:</span>
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {createdStudentCreds.password}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button
                onClick={copyCredsToClipboard}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px' }}
              >
                <Copy size={16} />
                <span>{copiedKey ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                onClick={() => setCreatedStudentCreds(null)}
                className="btn-primary"
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
          <input
            type="text"
            placeholder="Search by student name, Gmail, roll no, registration no, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 36 }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
        </div>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing {filteredStudents.length} of {students.length} students
        </span>
      </div>

      {/* Students Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading student records...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Users size={44} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h4 style={{ color: '#f8fafc', marginBottom: 4 }}>No Student Records Found</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add your first enrolled student to begin issuing certificates.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Student Profile & Gmail</th>
                <th style={{ padding: '14px 18px' }}>Roll & Reg No</th>
                <th style={{ padding: '14px 18px' }}>Course Program</th>
                <th style={{ padding: '14px 18px' }}>Phone</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={s.profile_photo || s.user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.user?.name || 'Student')}`}
                        alt={s.user?.name}
                        style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e293b', border: '1px solid #334155' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{s.user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={12} />
                          <span>{s.user?.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8' }}>{s.roll_number}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Reg: <span style={{ color: '#e2e8f0' }}>{s.student_id_number || 'N/A'}</span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{s.course}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{s.department} • {s.academic_year}</div>
                  </td>

                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                    {s.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={13} className="text-muted" />
                        <span>{s.phone}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      
                      {/* Add Original Document Button */}
                      <button
                        onClick={() => handleOpenAddDocModal(s)}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: 6, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                        title="Add Original Document or Certificate for this student"
                      >
                        <Award size={13} />
                        <span>Add Certificate</span>
                      </button>

                      {/* Edit Student Record & Reset Password */}
                      <button
                        onClick={() => {
                          setModalError(null);
                          setEditPassword('');
                          setSelectedEditStudent({ 
                            ...s, 
                            user: { ...s.user },
                            phone: s.phone || '',
                            student_id_number: s.student_id_number || '',
                            course: s.course || '',
                            department: s.department || '',
                            academic_year: s.academic_year || '2022-2026'
                          });
                        }}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.78rem', borderRadius: 6 }}
                        title="Edit details and reset student password"
                      >
                        <Edit2 size={13} />
                        <span>Edit / Reset Pass</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Original Document Modal */}
      {selectedAddDocStudent && (
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
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 580, padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <Award size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                    Add Original Certificate / Document
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#fbbf24' }}>
                    For Student: {selectedAddDocStudent.user?.name} ({selectedAddDocStudent.roll_number})
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedAddDocStudent(null)} className="hover:text-white" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {docSuccessMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', fontSize: '0.86rem', marginBottom: 14 }}>
                ✓ {docSuccessMsg}
              </div>
            )}

            {modalError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: '0.85rem', marginBottom: 14 }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddDocumentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Certificate / Document Type
                </label>
                <select
                  value={docFormData.document_type}
                  onChange={(e) => {
                    const dt = e.target.value;
                    setDocFormData(prev => ({
                      ...prev,
                      document_type: dt,
                      title: `${dt} - ${selectedAddDocStudent.user?.name}`
                    }));
                  }}
                  className="input-field"
                >
                  <option value="Degree Certificate">Degree Certificate (Original)</option>
                  <option value="10th Original Certificate">10th Original Secondary Certificate</option>
                  <option value="12th Original Certificate">12th Original Higher Secondary Certificate</option>
                  <option value="Consolidated Marksheet">Consolidated Official Marksheet</option>
                  <option value="Transfer / Migration Certificate">Transfer & Migration Certificate</option>
                  <option value="Provisional Degree">Provisional Degree</option>
                  <option value="Bonafide & Conduct Certificate">Bonafide & Conduct Certificate</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Document Display Title
                </label>
                <input
                  type="text"
                  required
                  value={docFormData.title}
                  onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Original Document Custody Checkbox */}
              <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    id="isOrigCheck"
                    checked={docFormData.is_original}
                    onChange={(e) => setDocFormData({ ...docFormData, is_original: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                  <label htmlFor="isOrigCheck" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fbbf24', cursor: 'pointer' }}>
                    Physical Original Certificate Deposited in College Custody / Safe
                  </label>
                </div>

                {docFormData.is_original && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Institutional Vault / Locker Shelf Reference Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Locker Room A / Shelf 4 / Box 12"
                      value={docFormData.locker_reference}
                      onChange={(e) => setDocFormData({ ...docFormData, locker_reference: e.target.value })}
                      className="input-field"
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                )}
              </div>

              {/* Upload Certificate File */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Upload Digital Scan / PDF (Optional - generates verifiable record automatically if blank)
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setDocFormData({ ...docFormData, file: e.target.files[0] });
                    }
                  }}
                  className="input-field"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setSelectedAddDocStudent(null)} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  <Sparkles size={16} />
                  <span>{uploadingDoc ? 'Registering Document...' : 'Add & Verify Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
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
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 640, padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                    Enroll New Student & Set Credentials
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    College Admin registers student details and assigns login password
                  </div>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="hover:text-white" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: '0.85rem', marginBottom: 16 }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Section 1: Personal Info & Login Credentials */}
              <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <KeyRound size={14} />
                  <span>1. Student Identity & Login Credentials</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gajjela Olive Jacinth Reddy"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Student Gmail / Email *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        required
                        placeholder="e.g. student@gmail.com"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                        className="input-field"
                        style={{ paddingLeft: 34 }}
                      />
                      <Mail size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Student Password (Admin Set) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewStudent({ ...newStudent, password: generateRandomPassword() })}
                        style={{ fontSize: '0.7rem', color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        Auto-Generate
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Set student login password"
                        value={newStudent.password}
                        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                        className="input-field"
                        style={{ paddingLeft: 34, paddingRight: 34 }}
                      />
                      <Lock size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Identifiers & Contact */}
              <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Hash size={14} />
                  <span>2. Official Academic Numbers & Phone</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Student Roll Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 22TK1A0501"
                      value={newStudent.roll_number}
                      onChange={(e) => setNewStudent({ ...newStudent, roll_number: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Registration Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. REG-2026-042"
                      value={newStudent.student_id_number}
                      onChange={(e) => setNewStudent({ ...newStudent, student_id_number: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Contact Phone No
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={newStudent.phone}
                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                        className="input-field"
                        style={{ paddingLeft: 32 }}
                      />
                      <Phone size={13} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Course & Department */}
              <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GraduationCap size={14} />
                  <span>3. Course & Academic Program</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Degree Course
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudent.course}
                      onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Department
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudent.department}
                      onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Academic Year
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudent.academic_year}
                      onChange={(e) => setNewStudent({ ...newStudent, academic_year: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '10px 20px' }}>
                  <UserPlus size={16} />
                  <span>{creating ? 'Registering Student...' : 'Enroll & Set Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student & Reset Password Modal */}
      {selectedEditStudent && (
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
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 620, padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                    Edit Student & Manage Credentials
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#fbbf24' }}>
                    Update details or reset password for {selectedEditStudent.user?.name}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEditStudent(null)} className="hover:text-white" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: '0.85rem', marginBottom: 16 }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* Name & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedEditStudent.user?.name || ''}
                    onChange={(e) => setSelectedEditStudent({
                      ...selectedEditStudent,
                      user: { ...selectedEditStudent.user, name: e.target.value }
                    })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Gmail / Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={selectedEditStudent.user?.email || ''}
                    onChange={(e) => setSelectedEditStudent({
                      ...selectedEditStudent,
                      user: { ...selectedEditStudent.user, email: e.target.value }
                    })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Password Reset Section */}
              <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <KeyRound size={14} />
                    <span>Reset Student Password (Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditPassword(generateRandomPassword())}
                    style={{ fontSize: '0.72rem', color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Generate Password
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Enter new password to reset, or leave blank to keep unchanged"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: 34, paddingRight: 34 }}
                  />
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  If the student is getting "Invalid credentials", type a new password here (e.g. <code>StudentPass@123</code>) and click Save.
                </div>
              </div>

              {/* Roll, Reg & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedEditStudent.roll_number || ''}
                    onChange={(e) => setSelectedEditStudent({ ...selectedEditStudent, roll_number: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={selectedEditStudent.student_id_number || ''}
                    onChange={(e) => setSelectedEditStudent({ ...selectedEditStudent, student_id_number: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={selectedEditStudent.phone || ''}
                    onChange={(e) => setSelectedEditStudent({ ...selectedEditStudent, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Course & Department */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Course Program
                  </label>
                  <input
                    type="text"
                    value={selectedEditStudent.course || ''}
                    onChange={(e) => setSelectedEditStudent({ ...selectedEditStudent, course: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={selectedEditStudent.department || ''}
                    onChange={(e) => setSelectedEditStudent({ ...selectedEditStudent, department: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setSelectedEditStudent(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '10px 20px' }}>
                  <Check size={16} />
                  <span>{creating ? 'Saving...' : 'Save & Update Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
