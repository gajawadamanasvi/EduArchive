import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-key-for-student-doc-system-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbType: process.env.DB_TYPE || 'sqlite_store', // 'sqlite_store' or 'mysql'
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_doc_verification'
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'built_in_agent', // 'gemini', 'openai', 'built_in_agent'
    apiKey: process.env.AI_API_KEY || ''
  },
  uploadDir: path.resolve(__dirname, '../../uploads'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};
