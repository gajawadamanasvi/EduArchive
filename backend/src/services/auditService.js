import db from '../config/db.js';

export const logAudit = async ({
  userId,
  action,
  entityType,
  entityId,
  details = {},
  ipAddress = '127.0.0.1'
}) => {
  try {
    const logEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      user_id: userId || 'SYSTEM',
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      ip_address: ipAddress,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      timestamp: new Date().toISOString()
    };

    db.insert('audit_logs', logEntry);
    return logEntry;
  } catch (error) {
    console.error('[AuditLog] Error writing audit log:', error.message);
  }
};

export const getAuditLogs = (limit = 100) => {
  return db.getAuditLogs(limit);
};
