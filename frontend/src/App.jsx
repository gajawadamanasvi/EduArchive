import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Chatbot } from './components/Chatbot.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// Pages
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.jsx';
import { StudentProfile } from './pages/student/StudentProfile.jsx';
import { StudentDocuments } from './pages/student/StudentDocuments.jsx';
import { StudentRequests } from './pages/student/StudentRequests.jsx';
import { StudentVerification } from './pages/student/StudentVerification.jsx';

// College Admin Pages
import { CollegeDashboard } from './pages/college/CollegeDashboard.jsx';
import { CollegeStudents } from './pages/college/CollegeStudents.jsx';
import { CollegeDocuments } from './pages/college/CollegeDocuments.jsx';
import { CollegeUpload } from './pages/college/CollegeUpload.jsx';
import { CollegeVerification } from './pages/college/CollegeVerification.jsx';
import { CollegeRequests } from './pages/college/CollegeRequests.jsx';
import { CollegeProfile } from './pages/college/CollegeProfile.jsx';

// Super Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminColleges } from './pages/admin/AdminColleges.jsx';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs.jsx';
import { AdminSettings } from './pages/admin/AdminSettings.jsx';

// Docs
import { DeveloperDocs } from './pages/DeveloperDocs.jsx';

// Layout wrapper for authenticated pages
const AppLayout = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="layout-container">
        <Sidebar onOpenChat={() => setChatOpen(true)} />
        <main className="main-content">
          {children}
        </main>
      </div>
      <Chatbot isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
};

// Root Redirect Helper
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'COLLEGE_ADMIN') return <Navigate to="/college/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/docs" element={<AppLayout><DeveloperDocs /></AppLayout>} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Student Protected Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AppLayout><StudentDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AppLayout><StudentProfile /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/documents" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AppLayout><StudentDocuments /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/requests" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AppLayout><StudentRequests /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/student/verification" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AppLayout><StudentVerification /></AppLayout>
            </ProtectedRoute>
          } />

          {/* College Admin Protected Routes */}
          <Route path="/college/dashboard" element={
            <ProtectedRoute allowedRoles={['COLLEGE_ADMIN', 'SUPER_ADMIN']}>
              <AppLayout><CollegeDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/college/students" element={
            <ProtectedRoute allowedRoles={['COLLEGE_ADMIN', 'SUPER_ADMIN']}>
              <AppLayout><CollegeStudents /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/college/documents" element={
            <ProtectedRoute allowedRoles={['COLLEGE_ADMIN', 'SUPER_ADMIN']}>
              <AppLayout><CollegeDocuments /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/college/upload" element={
            <ProtectedRoute allowedRoles={['COLLEGE_ADMIN', 'SUPER_ADMIN']}>
              <AppLayout><CollegeUpload /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/college/verification" element={
            <ProtectedRoute allowedRoles={['COLLEGE_ADMIN', 'SUPER_ADMIN']}>
              <AppLayout><CollegeVerification /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/college/requests" element={
            <ProtectedRoute allowedRoles={['COLLEGE_ADMIN', 'SUPER_ADMIN']}>
              <AppLayout><CollegeRequests /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/college/profile" element={
            <ProtectedRoute allowedRoles={['COLLEGE_ADMIN', 'SUPER_ADMIN']}>
              <AppLayout><CollegeProfile /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Super Admin Protected Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AppLayout><AdminDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/colleges" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AppLayout><AdminColleges /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/audit-logs" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AppLayout><AdminAuditLogs /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AppLayout><AdminSettings /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
