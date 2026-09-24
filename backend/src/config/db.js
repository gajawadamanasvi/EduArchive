import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Structure
const initialSchema = {
  users: [],
  colleges: [],
  students: [],
  documents: [],
  verification_records: [],
  document_requests: [],
  audit_logs: [],
  settings: {
    systemName: "Student Document Verification & Retrieval System",
    allowStudentRegistrations: true,
    requireAdminCollegeVerification: true,
    aiModel: "Built-in Neural OCR + Verification Agent v2.4",
    maintenanceMode: false
  }
};

class RelationalDatabase {
  constructor() {
    this.data = { ...initialSchema };
    this.isLoaded = false;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...initialSchema, ...JSON.parse(fileContent) };
      } else {
        this.save();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('[DB] Error loading database file, initializing fresh store:', err.message);
      this.data = { ...initialSchema };
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error persisting database file:', err.message);
    }
  }

  // Generic Query Helpers
  find(table, predicate = () => true) {
    const list = this.data[table] || [];
    return list.filter(predicate);
  }

  findOne(table, predicate = () => true) {
    const list = this.data[table] || [];
    return list.find(predicate) || null;
  }

  findById(table, id) {
    const list = this.data[table] || [];
    return list.find(item => String(item.id) === String(id)) || null;
  }

  insert(table, item) {
    if (!this.data[table]) {
      this.data[table] = [];
    }
    const newItem = {
      ...item,
      id: item.id || `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: item.created_at || new Date().toISOString()
    };
    this.data[table].push(newItem);
    this.save();
    return newItem;
  }

  update(table, id, updates) {
    const list = this.data[table] || [];
    const index = list.findIndex(item => String(item.id) === String(id));
    if (index === -1) return null;

    this.data[table][index] = {
      ...this.data[table][index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data[table][index];
  }

  delete(table, id) {
    const list = this.data[table] || [];
    const index = list.findIndex(item => String(item.id) === String(id));
    if (index === -1) return false;

    this.data[table].splice(index, 1);
    this.save();
    return true;
  }

  count(table, predicate = () => true) {
    const list = this.data[table] || [];
    return list.filter(predicate).length;
  }

  // Relations & Joins
  getStudentWithDetails(studentId) {
    const student = this.findById('students', studentId);
    if (!student) return null;

    const user = this.findById('users', student.user_id);
    const college = this.findById('colleges', student.college_id);

    return {
      ...student,
      user: user ? { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url } : null,
      college: college ? { id: college.id, name: college.name, college_code: college.college_code, verification_status: college.verification_status, university: college.university } : null
    };
  }

  getDocumentWithDetails(docId) {
    const doc = this.findById('documents', docId);
    if (!doc) return null;

    const student = this.findById('students', doc.student_id);
    const studentUser = student ? this.findById('users', student.user_id) : null;
    const college = this.findById('colleges', doc.college_id);
    const verification = this.findOne('verification_records', v => String(v.document_id) === String(doc.id));
    const uploader = this.findById('users', doc.uploaded_by);

    return {
      ...doc,
      student: student ? {
        ...student,
        name: studentUser ? studentUser.name : 'Unknown Student',
        email: studentUser ? studentUser.email : ''
      } : null,
      college: college || null,
      verification: verification || null,
      uploader: uploader ? { id: uploader.id, name: uploader.name, role: uploader.role } : null
    };
  }

  getAuditLogs(limit = 100) {
    const logs = [...(this.data.audit_logs || [])].reverse().slice(0, limit);
    return logs.map(log => {
      const user = this.findById('users', log.user_id);
      return {
        ...log,
        user_name: user ? user.name : 'System / Anonymous',
        user_role: user ? user.role : 'SYSTEM'
      };
    });
  }
}

export const db = new RelationalDatabase();
export default db;
