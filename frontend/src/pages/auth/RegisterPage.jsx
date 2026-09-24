import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { Shield, UserPlus, ArrowLeft, Building2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college_id: '',
    roll_number: '',
    student_id_number: '',
    course: 'Bachelor of Technology in Computer Science',
    department: 'Computer Science & Engineering',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await api.getColleges();
        if (data.success && data.colleges) {
          setColleges(data.colleges);
          if (data.colleges.length > 0) {
            setFormData(prev => ({ ...prev, college_id: data.colleges[0].id }));
          }
        }
      } catch (err) {
        console.warn('Failed to load colleges for registration dropdown.');
      }
    };
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await register({
      ...formData,
      role: 'STUDENT'
    });

    setLoading(false);
    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', position: 'relative', zIndex: 1 }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: 680,
        borderRadius: 24,
        padding: '36px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                Student Registration
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Create your student profile and connect with your institution
              </div>
            </div>
          </div>

          <Link to="/login" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 8 }}>
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', fontSize: '0.86rem', marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Full Legal Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. aarav@student.edu"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Enrolled College / Institution
              </label>
              <select
                name="college_id"
                value={formData.college_id}
                onChange={handleChange}
                className="input-field"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>
                    {c.name} {c.verification_status === 'VERIFIED' ? '✓' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Roll Number / Reg No
              </label>
              <input
                type="text"
                name="roll_number"
                required
                placeholder="e.g. APEX/CS/22/0101"
                value={formData.roll_number}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Student ID Number
              </label>
              <input
                type="text"
                name="student_id_number"
                placeholder="e.g. APEX-2022-CSE-042"
                value={formData.student_id_number}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Degree Program / Course
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: 12, fontSize: '0.95rem' }}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Creating Student Profile...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#60a5fa', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
