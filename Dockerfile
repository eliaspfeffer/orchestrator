# ── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build backend + compile node-pty native module ──────────────────
FROM node:22-bookworm-slim AS backend
WORKDIR /app/backend

# Build tools required for node-pty native compilation
RUN apt-get update && apt-get install -y \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm ci

# Rebuild node-pty against this Node version
RUN cd node_modules/node-pty && npx node-gyp rebuild

COPY backend/ ./

# Compile TypeScript → dist/
RUN npm run build

# Copy built frontend into dist/public (served as static files)
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
