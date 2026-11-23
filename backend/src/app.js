import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import versionRoutes from './routes/versionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isFallback } from './database/db.js';

export const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Index Endpoint at Root
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'SyncSpace Backend REST API',
    version: '1.0.0',
    status: 'online',
    message: 'Welcome to the SyncSpace API service. All application routes are prefixed with /api',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      workspaces: {
        list: 'GET /api/workspaces',
        create: 'POST /api/workspaces',
        details: 'GET /api/workspaces/:id',
        update: 'PUT /api/workspaces/:id',
        delete: 'DELETE /api/workspaces/:id',
        favorite: 'PATCH /api/workspaces/:id/favorite',
      },
    },
    docs: 'Refer to docs/API_DOCUMENTATION.md for endpoint specifications',
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SyncSpace Backend REST API',
    database: isFallback() ? 'in-memory-fallback' : 'mysql-connected',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', teamRoutes);
app.use('/api', commentRoutes);
app.use('/api', activityRoutes);
app.use('/api', versionRoutes);
app.use('/api', notificationRoutes);

// Catch-all 404 for unhandled API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
