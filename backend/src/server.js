import app from './app.js';
import config from './config/env.js';
import { initDatabase } from './database/db.js';

async function startServer() {
  try {
    // Initialize MySQL / Fallback Database
    await initDatabase();

    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 SyncSpace Backend REST API listening on port ${config.port}`);
      console.log(`   Health Check: http://localhost:${config.port}/api/health`);
      console.log(`   Environment:  ${config.nodeEnv}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start SyncSpace backend server:', err);
    process.exit(1);
  }
}

startServer();
