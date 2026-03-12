# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev && npm cache clean --force

# Production stage
FROM node:20-alpine

# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodeuser -u 1001 -G nodejs

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown -R nodeuser:nodejs logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/v1/health/live || exit 1

# Switch to non-root user
USER nodeuser

EXPOSE 3001

CMD ["node", "src/server.js"]
