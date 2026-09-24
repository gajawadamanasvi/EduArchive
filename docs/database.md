# Relational Database Schema & Data Models

The database is designed with 3rd Normal Form (3NF) relational integrity, supporting both MySQL 8.0 and SQLite relational file persistence with foreign keys and indexes.

---

## 1. Table Definitions

### 1. `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Unique user identifier |
| `name` | VARCHAR(255) | NOT NULL | User full legal name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| `password_hash`| VARCHAR(255) | NOT NULL | bcryptjs password hash (salt rounds: 10) |
| `role` | ENUM | NOT NULL | `STUDENT`, `COLLEGE_ADMIN`, `SUPER_ADMIN` |
| `status` | ENUM | DEFAULT 'ACTIVE'| `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `college_id` | VARCHAR(64) | FK -> `colleges.id`| Associated institution (for college admins / students) |
| `avatar_url` | TEXT | NULL | Profile avatar |
| `created_at` | DATETIME | DEFAULT CURRENT | Creation timestamp |

### 2. `colleges`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Unique college identifier |
| `name` | VARCHAR(255) | NOT NULL | Full institution name |
| `college_code` | VARCHAR(64) | NOT NULL, UNIQUE | Code (e.g. APEX-TECH) |
| `address` | TEXT | NULL | Physical campus location |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Registrar / Official email |
| `phone` | VARCHAR(32) | NULL | Contact phone |
| `website` | VARCHAR(255) | NULL | Official website URL |
| `university` | VARCHAR(255) | NULL | Affiliated University |
| `verification_status` | ENUM | DEFAULT 'PENDING' | `PENDING`, `VERIFIED`, `SUSPENDED` |
| `verified_at` | DATETIME | NULL | Timestamp of Super Admin verification |
| `verified_by` | VARCHAR(64) | FK -> `users.id` | Super Admin user ID who verified |

### 3. `students`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Unique student profile identifier |
| `user_id` | VARCHAR(64) | NOT NULL, UNIQUE, FK | References `users.id` |
| `college_id` | VARCHAR(64) | NOT NULL, FK | References `colleges.id` |
| `student_id_number` | VARCHAR(64) | NOT NULL | Institutional ID (e.g. APEX-2022-CSE-042) |
| `roll_number` | VARCHAR(64) | NOT NULL | Official Roll No (e.g. APEX/CS/22/0101) |
| `course` | VARCHAR(255) | NOT NULL | Enrolled program |
| `department` | VARCHAR(255) | NULL | Department name |
| `academic_year` | VARCHAR(32) | NULL | Batch session (e.g. 2022-2026) |
| `phone` | VARCHAR(32) | NULL | Contact phone number |

### 4. `documents`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Document record ID |
| `student_id` | VARCHAR(64) | NOT NULL, FK | Associated student |
| `college_id` | VARCHAR(64) | NOT NULL, FK | Associated issuing college |
| `document_type`| VARCHAR(128) | NOT NULL | `Degree Certificate`, `10th Certificate`, `Marksheet`, etc. |
| `title` | VARCHAR(255) | NOT NULL | Human-readable document title |
| `file_path` | TEXT | NOT NULL | File storage location on server |
| `file_name` | VARCHAR(255) | NOT NULL | Original filename |
| `status` | ENUM | DEFAULT 'PENDING' | `PENDING`, `VERIFIED`, `REJECTED`, `NEEDS_REVIEW`, `PHYSICAL_ISSUED` |
| `physical_issue_details` | JSON | NULL | Issued to, date, remarks, return date |
| `uploaded_by` | VARCHAR(64) | NOT NULL, FK | College Admin user ID who uploaded |

### 5. `verification_records`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Verification log ID |
| `document_id` | VARCHAR(64) | NOT NULL, FK | Target document |
| `verified_by` | VARCHAR(64) | NOT NULL, FK | User who ran or approved verification |
| `verification_status`| VARCHAR(64) | NOT NULL | `VERIFIED`, `REJECTED`, `NEEDS_REVIEW`, `AI_CONSISTENT` |
| `remarks` | TEXT | NULL | Administrative remarks |
| `ai_result` | JSON | NULL | Full OCR analysis payload, confidence score, and checks |

### 6. `document_requests`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Request ID |
| `student_id` | VARCHAR(64) | NOT NULL, FK | Requesting student |
| `college_id` | VARCHAR(64) | NOT NULL, FK | Target college |
| `document_type`| VARCHAR(128) | NOT NULL | Type of certificate requested |
| `reason` | TEXT | NOT NULL | Purpose / explanation |
| `urgent` | BOOLEAN | DEFAULT FALSE | Flag for urgent handling |
| `request_status`| ENUM | DEFAULT 'PENDING'| `PENDING`, `APPROVED`, `REJECTED`, `ISSUED` |
| `processed_by` | VARCHAR(64) | NULL, FK | Admin who processed request |

### 7. `audit_logs`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Audit event ID |
| `user_id` | VARCHAR(64) | NOT NULL | Actor user ID |
| `action` | VARCHAR(128) | NOT NULL | Event name (e.g. `DOCUMENT_VERIFIED`, `PHYSICAL_CERTIFICATE_ISSUED`) |
| `entity_type` | VARCHAR(64) | NOT NULL | `DOCUMENT`, `COLLEGE`, `STUDENT`, `USER` |
| `entity_id` | VARCHAR(64) | NULL | Record ID |
| `ip_address` | VARCHAR(45) | NOT NULL | IP of requesting client |
| `details` | JSON | NULL | Additional metadata diff |
| `timestamp` | DATETIME | DEFAULT CURRENT | Exact UTC timestamp |
