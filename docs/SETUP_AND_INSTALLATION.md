# SyncSpace – Setup and Installation Guide

This guide provides step-by-step instructions to set up, configure, run, and test the SyncSpace collaborative productivity platform on your development machine.

---

## 1. Prerequisites

Ensure the following tools are installed on your machine:
- **Node.js**: v18.0.0 or later (v20+ LTS recommended)
- **npm**: v9.0.0 or later
- **MySQL Server**: v8.0 or later *(Optional: If MySQL is not installed or running, SyncSpace automatically activates an integrated in-memory relational store!)*
- **Git**

Verify your environment by opening a terminal and running:
```bash
node -v
npm -v
git --version
```

---

## 2. Directory Structure

SyncSpace is structured as a clean full-stack monorepo:
```
React SYNC/
├── frontend/                     # React 19 Single Page Application (Port 5173)
├── backend/                      # Node.js/Express REST API (Port 5000)
├── collaboration-server/         # Hocuspocus WebSocket Server (Port 1234)
├── database/                     # MySQL schema & seed scripts
├── docs/                         # Master project documentation
└── docker-compose.yml            # Containerized deployment manifest
```

---

## 3. Quick Start (Standard Local Execution)

Running SyncSpace requires three terminal sessions for each service:

### Terminal 1: Backend REST API
```bash
cd backend
npm install
npm run dev
```
- **Port**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`
- **Database**: Connects to MySQL on port 3306 or falls back to in-memory store automatically.

### Terminal 2: Collaboration WebSocket Gateway
```bash
cd collaboration-server
npm install
npm start
```
- **Port**: `ws://localhost:1234`
- **Protocol**: Binary WebSocket handling Yjs CRDT delta updates and presence awareness.

### Terminal 3: React Frontend Client
```bash
cd frontend
npm install
npm run dev
```
- **Port**: `http://localhost:5173`
- Open your browser to `http://localhost:5173`. You can log in using the demo account:
  - **Email**: `alex@syncspace.dev`
  - **Password**: `password123`

---

## 4. Database Setup (MySQL 8.0)

If you have a local MySQL 8.0 server installed:

### Step 1: Create Database & Tables
```bash
mysql -u root -p < database/schema.sql
```

### Step 2: Seed Initial Demo Data
```bash
mysql -u root -p < database/seed.sql
```

### Step 3: Configure `.env` Files
Configure `backend/.env` and `collaboration-server/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=syncspace_db
```

*Note: If MySQL is unavailable, the backend outputs a friendly notice and switches to the in-memory fallback store so you can develop without blocking.*

---

## 5. Docker Compose (Single Command Launch)

To start the entire stack inside containers without installing MySQL locally:
```bash
docker-compose up --build
```
This boots:
1. `mysql`: Official MySQL 8.0 image with auto-mounted `schema.sql` and `seed.sql`.
2. `backend`: Express REST API on `http://localhost:5000`.
3. `collab-server`: Hocuspocus CRDT Server on `ws://localhost:1234`.
4. `frontend`: NGINX production web server serving the React SPA on `http://localhost:5173`.

---

## 6. Running the Automated Test Suite (56 Tests Passing)

SyncSpace includes 56 automated tests across 13 test files:

### Frontend Unit & Integration Tests (21 tests)
```bash
cd frontend
npm test
```

### Backend REST API Tests (32 tests)
```bash
cd backend
npm test
```

### Collaboration Server Tests & CRDT Simulation (3 tests + Multi-Peer Sim)
```bash
cd collaboration-server
npm test
node test/multi_user_simulation.js
```

---

## 7. Production Build Verification

To test minification, tree-shaking, and production asset generation:
```bash
cd frontend
npm run build
npm run preview
```
The production bundle is generated in `frontend/dist/`.
