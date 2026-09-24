const API_BASE = '/api';

class ApiService {
  getToken() {
    return localStorage.getItem('std_doc_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('std_doc_token', token);
    } else {
      localStorage.removeItem('std_doc_token');
    }
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      ...options.headers
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      // Handle file download streams directly
      const contentType = response.headers.get('content-type');
      if (contentType && (contentType.includes('image/svg') || contentType.includes('application/pdf') || contentType.includes('octet-stream'))) {
        if (!response.ok) {
          throw new Error('Failed to download document file');
        }
        return response.blob();
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Auth APIs
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // Student APIs
  getStudentProfile(id = null) {
    return this.request(id ? `/students/${id}` : '/students/profile');
  }

  updateStudentProfile(id, data) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  getCollegeStudents(collegeId = null) {
    const query = collegeId ? `?college_id=${collegeId}` : '';
    return this.request(`/students${query}`);
  }

  createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  // College APIs
  getColleges(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/colleges${query ? `?${query}` : ''}`);
  }

  getCollegeById(id) {
    return this.request(`/colleges/${id}`);
  }

  createCollege(data) {
    return this.request('/colleges', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateCollegeVerification(id, status) {
    return this.request(`/colleges/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  updateCollegeProfile(id, data) {
    return this.request(`/colleges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Document APIs
  getDocuments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/documents${query ? `?${query}` : ''}`);
  }

  getDocumentById(id) {
    return this.request(`/documents/${id}`);
  }

  uploadDocument(formData) {
    return this.request('/documents/upload', {
      method: 'POST',
      body: formData
    });
  }

  downloadDocument(id) {
    return this.request(`/documents/${id}/download`);
  }

  recordPhysicalIssue(id, payload) {
    return this.request(`/documents/${id}/physical-issue`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  deleteDocument(id) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE'
    });
  }

  // Verification APIs
  runAIScan(documentId, customOcrText = null) {
    return this.request('/verification/scan', {
      method: 'POST',
      body: JSON.stringify({ document_id: documentId, custom_ocr_text: customOcrText })
    });
  }

  updateVerificationStatus(documentId, status, remarks = '') {
    return this.request(`/verification/${documentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks })
    });
  }

  getVerificationHistory(documentId) {
    return this.request(`/verification/${documentId}/history`);
  }

  // Document Request APIs
  createDocumentRequest(data) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getDocumentRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/requests${query ? `?${query}` : ''}`);
  }

  processDocumentRequest(id, status, remarks = '') {
    return this.request(`/requests/${id}/process`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks })
    });
  }

  // Admin APIs
  getGlobalStats() {
    return this.request('/admin/stats');
  }

  getAuditLogs(limit = 100) {
    return this.request(`/admin/audit-logs?limit=${limit}`);
  }

  getSystemSettings() {
    return this.request('/admin/settings');
  }

  updateSystemSettings(settings) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // AI Chatbot APIs
  sendChatMessage(message) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  getSuggestedQuestions() {
    return this.request('/ai/suggested-questions');
  }
}

export const api = new ApiService();
export default api;
