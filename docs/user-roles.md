# Role-Based Access Control (RBAC) & Permissions Matrix

DOCUVERIFY enforces strict authorization guards across all frontend routes and backend REST APIs.

---

## 1. Role Capabilities Matrix

| Capability / Resource | Student | College Admin | Super Admin |
|---|:---:|:---:|:---:|
| **Authentication & Profile** |
| Register Student Account | ✅ | ❌ | ❌ |
| Login & JWT Token Auth | ✅ | ✅ | ✅ |
| View Own Student Profile | ✅ | ❌ (Own College) | ✅ (All) |
| Edit Safe Fields (Phone / Preferences) | ✅ | ❌ | ❌ |
| Edit Official Records (Roll No, Course) | ❌ | ✅ (Own College) | ✅ (All) |
| Submit "Request Profile Change" | ✅ | ❌ | ❌ |
| **Documents & Certificates** |
| View Own Certificates | ✅ | ❌ | ✅ |
| Download Authorized Certificate | ✅ (Own only) | ✅ (College only) | ✅ (All) |
| Upload Certificates | ❌ | ✅ (College only) | ✅ (All) |
| Trigger AI Verification Scan | ❌ | ✅ | ✅ |
| Change Certificate Verification Status | ❌ | ✅ | ✅ |
| Record Physical Certificate Issue / Return | ❌ | ✅ | ✅ |
| Delete Certificate | ❌ (Denied) | ✅ | ✅ |
| Access Another Student's Document | ❌ (Denied: 403) | ❌ (Denied: 403) | ✅ |
| **Institutional Governance** |
| Add New College | ❌ | ❌ | ✅ |
| Grant "✓ Verified College" Badge | ❌ (Denied) | ❌ (Denied) | ✅ (Strict) |
| Suspend College Access | ❌ | ❌ | ✅ |
| View System Audit Logs | ❌ (Denied: 403) | ❌ (Denied: 403) | ✅ |
| Platform Global Configuration | ❌ | ❌ | ✅ |
| **Requests & Chatbot** |
| Submit Certificate Retrieval Request | ✅ | ❌ | ❌ |
| Process & Approve Student Requests | ❌ | ✅ | ✅ |
| DocumentAssist AI Interactive Assistant | ✅ | ✅ | ✅ |

---

## 2. Security Enforcement Policy
1. **Never Depend on Frontend Hiding Alone**: Backend middleware (`authenticate`, `requireRoles`, `requireDocumentAccess`, `requireStudentAccess`) validates ownership on every single API request.
2. **ID Tampering Prevention**: If a student changes URL parameters (e.g. `/api/documents/doc_101` to `/api/documents/doc_301`), the backend ownership verification rejects the request with `403 Forbidden`.
