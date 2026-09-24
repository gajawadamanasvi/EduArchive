import app from './app.js';
import { config } from './config/index.js';
import db from './config/db.js';
import { seedDatabase } from './seeds/seed.js';

const startServer = async () => {
  try {
    // Check if database needs initial seeding
    if (!db.data.users || db.data.users.length === 0) {
      console.log('[Server] Initializing database with demo records...');
      await seedDatabase();
      db.init();
    }

    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 STUDENT DOCUMENT VERIFICATION BACKEND IS RUNNING`);
      console.log(`📍 Port: ${config.port}`);
      console.log(`🌐 Mode: ${config.nodeEnv}`);
      console.log(`🛡️  RBAC: Active (Student, College Admin, Super Admin)`);
      console.log(`🤖 AI Engine: Active (${config.ai.provider})`);
      console.log(`📊 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('[Server Error] Failed to start backend server:', error);
    process.exit(1);
  }
};

startServer();
