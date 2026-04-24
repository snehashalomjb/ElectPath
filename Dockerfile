# ─── Build stage: Vite frontend ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install client dependencies and build
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build
# Output: /app/client/dist

# ─── Production stage: Express server ────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built frontend
COPY --from=builder /app/client/dist ./client/dist

# Environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/index.js"]
