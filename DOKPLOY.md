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

### Option 1: Docker Compose (Highly Recommended)
Dokploy supports deployments via `docker-compose.yml`. This setup includes persistent volume mounting for the SQLite database.

1. Deploy on Dokploy as a **Compose** application.
2. The configuration is defined in the root `docker-compose.yml` file.
3. It will automatically build the `Dockerfile` and mount a persistent volume (`tika-data`) to prevent data loss.

### Option 2: Dockerfile
Ensure port mapping/forwarding points to port `8787` (defined in the Dockerfile).

**Required Environment Variables**:
- `PORT`: `8787`
- `TIKA_DB`: `/app/server/data/tika.db`
- `TIKA_HTTPS`: `1`
