# STUDENT DOCUMENT VERIFICATION AND RETRIEVAL SYSTEM (DOCUVERIFY)

[![React 18](https://img.shields.io/badge/Frontend-React%2018%20(Vite)-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-Relational%20Store%20%2F%20MySQL-orange.svg)](https://www.mysql.com/)
[![AI Powered](https://img.shields.io/badge/AI%20Engine-Neural%20OCR%20Verification-purple.svg)](docs/ai-module.md)
[![Security](https://img.shields.io/badge/Security-Strict%20RBAC%20%26%20JWT-red.svg)](docs/user-roles.md)

A production-grade, secure, AI-powered web platform that allows accredited colleges to securely store, verify, and track academic certificates digitally, and enables students to retrieve their authorized certificates 24/7 for employment, higher education, scholarships, visa, and government verifications.

---

## 🚀 Key Features

### 🎓 1. Student Portal
- **Instant Certificate Retrieval**: View, inspect, and download official verified digital certificates anytime (Degree, 10th, 12th, Transcripts).
- **Verification Status Tracking**: Monitor real-time institutional verification status and automated AI confidence scores.
- **Document Retrieval Requests**: Submit official requests for degree certificates or transcripts with urgent handling flags.
- **Profile Identity Management**: View official student credentials with protected identity fields (Student ID & Roll Number) and safe editable contact info.
- **Interactive DocumentAssist AI**: Floating AI assistant with pre-built prompt chips, context-aware queries, and deep-linking navigation buttons.

### 🏛️ 2. College Administration Portal
- **Certificate Repository Management**: Digital management of all student certificates issued by the institution.
- **Upload & AI OCR Verification Scan**: Upload certificate scans with real-time OCR entity extraction and database cross-referencing.
- **Verification Queue**: Review AI anomaly warnings, compare extracted fields side-by-side with student records, and approve or reject certificates.
- **Physical Certificate Tracker**: Log when a physical certificate is temporarily issued to a student (e.g., for embassy/visa interviews) with dates, remarks, and return tracking.
- **Student Request Processing**: Review, approve, and process student document retrieval requests.
- **Student Enrollment Directory**: Enroll new students, update records, and manage roll numbers.

### 🛡️ 3. Super Administrator Master Console
- **Institutional Governance**: Add, approve, and suspend participating colleges.
- **Cryptographic Accreditation Authority**: Exclusively grant the official **✓ VERIFIED COLLEGE** badge.
- **Global Metrics & Platform Oversight**: Monitor system-wide certificates, students, verifications, and anomalous scans.
- **Tamper-Proof Audit Trail**: Real-time searchable log of all administrative actions, uploads, verifications, and status changes.
- **Platform Configuration**: Configure global enrollment policies, maintenance modes, and AI engine parameters.

### 🤖 4. AI Verification Agent & Chatbot
- **6-Step AI Verification Pipeline**: OCR extraction ➔ Entity identification ➔ Database cross-referencing ➔ Discrepancy analysis ➔ Confidence scoring (0-100%) ➔ Recommendation.
- **Anomaly Detection**: Flags 🟢 Consistent records, 🟡 Needs Manual Review, and 🔴 Suspicious/Mismatch documents.
- **Navigation Chatbot**: Answers platform questions, provides personalized student stats, and renders direct navigation deep-link action buttons.

---

## 🏛️ System Architecture

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|   React 18 SPA (Vite) + React Router v6 + Lucide Icons + Responsive CSS  |
+-------------------------------------------------------------------------+
                                    | (HTTP REST / JSON)
                                    v
+-------------------------------------------------------------------------+
|                             API GATEWAY                                 |
|   Node.js + Express.js Server (Port 5000)                              |
|   - Helmet Security Headers & CORS Configuration                        |
|   - Request Sanitization & Error Normalization                          |
+-------------------------------------------------------------------------+
         |                          |                         |
         v                          v                         v
+------------------+     +--------------------+    +----------------------+
| AUTH & SECURITY  |     | AI PROCESSING CORE |    | CONTROLLERS & LOGIC  |
| - JWT Tokens     |     | - OCR Extraction   |    | - Student / College  |
| - bcryptjs Hash  |     | - Entity Matching  |    | - Documents / Certs  |
| - RBAC Guard     |     | - Anomaly Scoring  |    | - Requests & State   |
| - Ownership Auth |     | - NLP Chatbot      |    | - Audit Logger       |
+------------------+     +--------------------+    +----------------------+
         |                          |                         |
         +--------------------------+-------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                           PERSISTENCE TIER                              |
|   - Relational Database Layer (Dual Support: SQLite Store / MySQL 8.0)  |
|   - File System Storage (PDF / Image Certificate Scans)                 |
+-------------------------------------------------------------------------+
```

---

## 🔑 Demo Login Credentials

The system includes pre-seeded demo accounts for testing all roles:

| Role | Name | Email | Password | Scope & Persona |
|---|---|---|---|---|
| **Super Admin** | Dr. Evelyn Vance | `superadmin@system.edu` | `AdminPass@123` | Platform oversight, verify colleges, audit logs |
| **College Admin** | Prof. Rajesh Sharma (Dean) | `admin@apex.edu` | `CollegePass@123` | Apex Institute Admin, AI verification, physical issuance |
| **College Admin** | Dr. Michael Chang | `admin@globaluniv.edu` | `CollegePass@123` | Global University Registrar |
| **Student** | Aarav Sharma | `aarav.sharma@student.edu` | `StudentPass@123` | Apex CSE Student (4 certificates, 1 physical issued) |
| **Student** | Priya Patel | `priya.patel@student.edu` | `StudentPass@123` | Apex IT Student (2 certificates, 1 pending request) |
| **Student** | Vikram Sen | `vikram.sen@student.edu` | `StudentPass@123` | Sunrise Science Student (Includes AI Mismatch sample) |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide React Icons, Modern Responsive CSS System (Dark theme, glassmorphism, fluid cards).
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, `multer`, `helmet`, `morgan`, `cors`.
- **Database**: Relational Database with normalized schema (Foreign keys, indexes), dual-mode SQLite store and MySQL 8.0 support (`mysql2`).
- **AI Core**: Modular Neural OCR & Verification Agent with fuzzy similarity scoring and intent-based navigation chatbot.

---

## 📦 Installation & Quick Start

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/your-org/student-document-verification.git
cd student-document-verification
```

### 2. Install Dependencies
```bash
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Seed Database
```bash
cd backend
npm run seed
```

### 4. Start Development Servers
In Terminal 1 (Backend API):
```bash
cd backend
npm start
# API starts at http://localhost:5000 (Health Check: /api/health)
```

In Terminal 2 (Frontend React App):
```bash
cd frontend
npm run dev
# Frontend starts at http://localhost:5173
```

---

## 📂 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, JWT config, environment settings
│   │   ├── controllers/     # Auth, student, college, document, verification, request, admin, AI
│   │   ├── routes/          # Express route endpoints
│   │   ├── middleware/      # Auth (JWT), RBAC (Role & ownership), Upload (Multer)
│   │   ├── services/        # Audit logging, business logic
│   │   ├── ai/              # AI Verification Agent & Chatbot Service
│   │   ├── seeds/           # Database seeder & MySQL production schema
│   │   ├── app.js           # Express app setup & security middleware
│   │   └── server.js        # Server listener
│   ├── data/                # Database file store
│   └── uploads/             # Certificate upload directory
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, Badges, DocumentCard, AI Modals, Chatbot
│   │   ├── context/         # AuthContext with session & role management
│   │   ├── pages/           # Student, College Admin, Super Admin, Auth, Docs
│   │   ├── services/        # API communication client (api.js)
│   │   ├── styles/          # Design system & tokens (index.css)
│   │   ├── App.jsx          # Route definitions & RBAC guards
│   │   └── main.jsx         # App mounting point
│   └── vite.config.js       # Vite configuration with proxy
├── docs/                    # Complete architectural & technical documentation
└── README.md                # Project documentation
```

---

## 📚 In-Depth Documentation

- [Project Overview](docs/project-overview.md)
- [System Architecture](docs/architecture.md)
- [Database Schema & Models](docs/database.md)
- [REST API Specifications](docs/api-documentation.md)
- [AI Verification Module](docs/ai-module.md)
- [Role-Based Access Control (RBAC)](docs/user-roles.md)
- [Production Deployment Guide](docs/deployment.md)
- [Future Enhancements & Roadmap](docs/future-enhancements.md)

---

## 🔒 Security & RBAC Policies

1. **Strict Resource Ownership Checks**: A student attempting to access another student's document ID directly (e.g. `/api/documents/doc_301`) is immediately blocked by backend RBAC middleware with `403 Forbidden`.
2. **Institutional Isolation**: College Admins can only view and manage students and certificates belonging to their own college.
3. **Super Admin Exclusivity**: Only Super Administrators can grant the **✓ Verified College** badge or view platform audit logs.
4. **Official Identity Lock**: Critical identity fields (Student ID, Roll Number, Course) cannot be modified by students directly; changes require formal administrative approval via the "Request Profile Change" workflow.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
