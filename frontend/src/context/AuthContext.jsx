import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { DEMO_USERS } from '../constants/demoUsers.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          api.setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('[AuthContext] Stored token invalid or expired.');
        api.setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.login(email, password);
      if (data.success && data.token) {
        api.setToken(data.token);
        // Refresh full user context with relations
        const meData = await api.getMe();
        setUser(meData.user || data.user);
        return { success: true, user: meData.user || data.user };
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const data = await api.register(formData);
      if (data.success && data.token) {
        api.setToken(data.token);
        const meData = await api.getMe();
        setUser(meData.user || data.user);
        return { success: true, user: meData.user || data.user };
      }
      throw new Error(data.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const switchDemoUser = async (userKey) => {
    const target = DEMO_USERS.find(u => u.key === userKey);
    if (!target) return;
    return login(target.email, target.password);
  };

  const isStudent = user?.role === 'STUDENT';
  const isCollegeAdmin = user?.role === 'COLLEGE_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      switchDemoUser,
      isStudent,
      isCollegeAdmin,
      isSuperAdmin,
      demoUsers: DEMO_USERS
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
