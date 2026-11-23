# SyncSpace – Deployment Guide

This guide details the planned deployment architecture for staging and production hosting.

---

## 1. Deployment Topology

SyncSpace is composed of three deployed services:
1. **Frontend**: Static React single-page application deployed to **Netlify** (or Vercel).
2. **Backend REST API**: Express.js web service deployed to **Render** or **Railway**.
3. **Collaboration WebSocket Gateway**: Hocuspocus Node.js service with persistent WebSocket connectivity deployed to **Render** (as a Background Worker or Web Service with WebSocket support).
4. **Database**: Managed **MySQL 8.0** hosted on PlanetScale, Aiven, or Railway MySQL.

```
                           +---------------------------+
                           | Netlify (React SPA)       |
                           | https://syncspace.app     |
                           +-------------+-------------+
                                         |
                       +-----------------+-----------------+
                       |                                   |
                HTTPS REST (JSON)                    WSS (Binary Yjs)
                       |                                   |
                       v                                   v
        +----------------------------+      +-------------------------------+
        | Render REST Service        |      | Render Collaboration Service  |
        | https://api.syncspace.app  |      | wss://collab.syncspace.app    |
        +--------------+-------------+      +---------------+---------------+
                       |                                    |
                       +-----------------+------------------+
                                         |
                                         v
                         +-------------------------------+
                         | Hosted MySQL 8.0 Database     |
                         | (Tables, Snapshots, Deltas)   |
                         +-------------------------------+
```

---

## 2. Environment Variables Specification

### Frontend (`frontend/.env.production`)
```env
VITE_API_BASE_URL=https://api.syncspace.app/api
VITE_COLLAB_WS_URL=wss://collab.syncspace.app
```

### Backend (`backend/.env.production`)
```env
PORT=5000
NODE_ENV=production
DB_HOST=your-mysql-host.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your_secure_password
DB_NAME=syncspace_db
JWT_SECRET=super_secret_jwt_key_2026_xyz
CORS_ORIGIN=https://syncspace.app
```

### Collaboration Server (`collaboration-server/.env.production`)
```env
PORT=1234
NODE_ENV=production
DB_HOST=your-mysql-host.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your_secure_password
DB_NAME=syncspace_db
```

---

## 3. Frontend Netlify Configuration (`_redirects`)
To support React Router DOM client-side routing on page refresh, a `_redirects` file is included in `frontend/public/_redirects`:
```
/*    /index.html   200
```
