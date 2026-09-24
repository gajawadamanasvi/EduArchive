# REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/login`
Authenticate user with email and password.
- **Request Body**:
  ```json
  {
    "email": "aarav.sharma@student.edu",
    "password": "StudentPass@123"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "usr_student_1",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@student.edu",
      "role": "STUDENT",
      "student_id": "stu_1",
      "college_id": "col_apex"
    }
  }
  ```

### `POST /api/auth/register`
Register a new student account affiliated with an institution.
- **Request Body**:
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav.sharma@student.edu",
    "password": "StudentPass@123",
    "role": "STUDENT",
    "college_id": "col_apex",
    "roll_number": "APEX/CS/22/0101",
    "course": "Bachelor of Technology in Computer Science",
    "phone": "+91 98765 43210"
  }
  ```

### `GET /api/auth/me`
Retrieve active user session and associated student/college details.
- **Headers**: `Authorization: Bearer <token>`

---

## 2. Document Endpoints (`/api/documents`)

### `GET /api/documents`
List documents filtered by user role, search query, status, and type.
- **Query Params**: `status`, `type`, `search`, `student_id`, `college_id`
- **Headers**: `Authorization: Bearer <token>`

### `GET /api/documents/:id`
Fetch single document details. Strictly verifies user ownership / role access.

### `GET /api/documents/:id/download`
Download official verifiable certificate SVG / PDF stream.

### `POST /api/documents/upload` (College Admin / Super Admin)
Upload certificate scan and trigger automated AI OCR verification.
- **Form Data**:
  - `file`: (Multipart file)
  - `student_id`: "stu_1"
  - `document_type`: "Degree Certificate"
  - `title`: "B.Tech Degree Certificate"
  - `run_ai_verification`: "true"

### `POST /api/documents/:id/physical-issue` (College Admin)
Record physical certificate temporary issue or return.
- **Request Body**:
  ```json
  {
    "action_type": "ISSUE",
    "issued_to": "Aarav Sharma",
    "issued_date": "2026-09-20",
    "remark": "Certificate temporarily issued to student upon request.",
    "return_expected_date": "2026-10-05"
  }
  ```

---

## 3. AI & Verification Endpoints (`/api/verification` & `/api/ai`)

### `POST /api/verification/scan`
Run AI OCR scan and cross-verify with institutional database.
- **Request Body**:
  ```json
  {
    "document_id": "doc_101"
  }
  ```

### `PATCH /api/verification/:id/status` (College Admin)
Update certificate verification status.
- **Request Body**:
  ```json
  {
    "status": "VERIFIED",
    "remarks": "Formally verified by Dean."
  }
  ```

### `POST /api/ai/chat`
Ask natural language questions to DocumentAssist AI.
- **Request Body**:
  ```json
  {
    "message": "Where can I see my certificates?"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "reply": "You can view, inspect, and download all authorized digital certificates directly from the **My Documents** page in your sidebar navigation.",
    "actions": [
      {
        "label": "Go to My Documents",
        "route": "/student/documents",
        "variant": "primary"
      }
    ]
  }
  ```
