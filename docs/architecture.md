# System Architecture Specification

## 1. High-Level Architecture Diagram

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|   React 18 SPA (Vite) + React Router v6 + Lucide Icons + Responsive CSS  |
+-------------------------------------------------------------------------+
                                    | (HTTPS / REST JSON)
                                    v
+-------------------------------------------------------------------------+
|                             API GATEWAY                                 |
|   Node.js + Express.js Server (Port 5000)                              |
|   - Helmet Security Headers & CORS                                      |
|   - Compression & Request Sanitization                                 |
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
|   - File System Uploads (PDF / Images with MIME Validation)             |
+-------------------------------------------------------------------------+
```

## 2. Directory Structure

```
hack1/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection, environment settings
│   │   ├── controllers/     # Auth, student, college, document, verification, request, admin, AI
│   │   ├── routes/          # Express route definitions
│   │   ├── middleware/      # Auth (JWT), RBAC (Role isolation), Upload (Multer)
│   │   ├── services/        # Business logic, audit logging
│   │   ├── ai/              # AI Verification Agent & DocumentAssist Chatbot
│   │   ├── seeds/           # Database seed scripts & MySQL schema
│   │   ├── app.js           # Express app setup & middleware
│   │   └── server.js        # Entry point & port listener
│   ├── data/                # Relational store persistence
│   └── uploads/             # Secure certificate uploads
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, Badges, DocumentCard, AI Modals, Chatbot
│   │   ├── context/         # AuthContext with session & role management
│   │   ├── pages/           # Student, College Admin, Super Admin, Auth, Docs
│   │   ├── services/        # Centralized API client (api.js)
│   │   ├── styles/          # Design system & tokens (index.css)
│   │   ├── App.jsx          # React Router v6 routing
│   │   └── main.jsx         # App mounting
│   └── vite.config.js       # Vite build & backend proxy config
├── docs/                    # Complete architectural and technical documentation
└── README.md                # Comprehensive project guide & setup manual
```
