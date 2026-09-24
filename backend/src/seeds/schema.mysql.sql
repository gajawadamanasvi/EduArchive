-- =============================================================================
-- STUDENT DOCUMENT VERIFICATION AND RETRIEVAL SYSTEM - MYSQL SCHEMA
-- Production Relational Schema with Foreign Keys, Indexes, and Constraints
-- =============================================================================

CREATE DATABASE IF NOT EXISTS student_doc_verification CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_doc_verification;

-- 1. Colleges Table
CREATE TABLE IF NOT EXISTS colleges (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    college_code VARCHAR(64) NOT NULL UNIQUE,
    address TEXT,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32),
    website VARCHAR(255),
    university VARCHAR(255),
    verification_status ENUM('PENDING', 'VERIFIED', 'SUSPENDED') DEFAULT 'PENDING',
    verified_at DATETIME NULL,
    verified_by VARCHAR(64) NULL,
    logo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_college_code (college_code),
    INDEX idx_college_status (verification_status)
) ENGINE=InnoDB;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'COLLEGE_ADMIN', 'SUPER_ADMIN') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    college_id VARCHAR(64) NULL,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    college_id VARCHAR(64) NOT NULL,
    student_id_number VARCHAR(64) NOT NULL,
    roll_number VARCHAR(64) NOT NULL,
    course VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    academic_year VARCHAR(32),
    phone VARCHAR(32),
    profile_photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    INDEX idx_student_roll (roll_number),
    INDEX idx_student_college (college_id)
) ENGINE=InnoDB;

-- 4. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    college_id VARCHAR(64) NOT NULL,
    document_type VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT DEFAULT 0,
    mime_type VARCHAR(64) DEFAULT 'application/pdf',
    status ENUM('PENDING', 'VERIFIED', 'REJECTED', 'NEEDS_REVIEW', 'PHYSICAL_ISSUED') DEFAULT 'PENDING',
    physical_issue_details JSON NULL,
    uploaded_by VARCHAR(64) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_doc_student (student_id),
    INDEX idx_doc_college (college_id),
    INDEX idx_doc_status (status)
) ENGINE=InnoDB;

-- 5. Verification Records Table
CREATE TABLE IF NOT EXISTS verification_records (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL,
    verified_by VARCHAR(64) NOT NULL,
    verification_status VARCHAR(64) NOT NULL,
    remarks TEXT,
    ai_result JSON NULL,
    verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_vr_document (document_id)
) ENGINE=InnoDB;

-- 6. Document Requests Table
CREATE TABLE IF NOT EXISTS document_requests (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    college_id VARCHAR(64) NOT NULL,
    document_id VARCHAR(64) NULL,
    document_type VARCHAR(128) NOT NULL,
    reason TEXT NOT NULL,
    urgent BOOLEAN DEFAULT FALSE,
    request_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'ISSUED') DEFAULT 'PENDING',
    processed_by VARCHAR(64) NULL,
    remarks TEXT,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_req_student (student_id),
    INDEX idx_req_college (college_id),
    INDEX idx_req_status (request_status)
) ENGINE=InnoDB;

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    details JSON NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB;
