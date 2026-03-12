# Build stage
FROM python:3.11-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

# Create non-root user
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -m appuser

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

COPY --chown=appuser:appgroup . .

# Create model directory
RUN mkdir -p models && chown -R appuser:appgroup models

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:3004/api/v1/health/live')" || exit 1

USER appuser

EXPOSE 3004

WORKDIR /app/src

CMD ["gunicorn", "--bind", "0.0.0.0:3004", "--workers", "2", "--timeout", "120", "app:create_app()"]
