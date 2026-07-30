# Dokploy Deployment Configuration

This project is structured as a monorepo containing a Node.js backend (in `server/`) and a React frontend (in `client/`).

## Local Production Build

To build the client assets locally and serve them via Node.js server:
1. Build the React app:
   ```bash
   cd client && npm install && npm run build
   ```
2. The Node.js backend serves static files from `client/dist` directly.

## Dokploy Setup Options

### Option 1: Dockerfile (Recommended & Tested)
Dokploy can build this automatically using the root `Dockerfile`.
Ensure port mapping/forwarding points to port `8787` (defined in the Dockerfile).

### Option 2: Nixpacks / Buildpack Deployment
You can deploy using the `nixpacks.toml` configuration included in this repository.

**Required Environment Variables**:
- `PORT`: `8787`
- `TIKA_DB`: `/app/server/data/tika.db` (Persistent volume mount recommended for SQLite database inside `/app/server/data`)
- `TIKA_HTTPS`: `1` (If using SSL/HTTPS)
