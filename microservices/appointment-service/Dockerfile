FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs . .
RUN mkdir -p logs && chown -R nodeuser:nodejs logs

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/api/v1/health/live || exit 1

USER nodeuser
EXPOSE 3002
CMD ["node", "src/server.js"]
