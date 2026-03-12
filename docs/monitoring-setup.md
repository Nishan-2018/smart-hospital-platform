# Monitoring & Observability Guide

## Overview

The Smart Hospital Platform implements full observability using:

1. **Prometheus** — Metrics collection and alerting
2. **Grafana** — Dashboards and visualization
3. **ELK Stack** — Centralized logging

## Prometheus

### Configuration

The Prometheus configuration is in `monitoring/prometheus/prometheus.yml`.

### Metrics Collected

Each microservice exposes a `/metrics` endpoint with:

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests by method, route, status |
| `http_request_duration_seconds` | Histogram | Request duration with p50/p95/p99 |
| `active_connections` | Gauge | Current active connections |
| `process_resident_memory_bytes` | Gauge | Memory usage |
| `process_cpu_seconds_total` | Counter | CPU time |
| `nodejs_heap_size_total_bytes` | Gauge | Node.js heap size |

### Alert Rules

Located in `monitoring/prometheus/alert_rules.yml`:

| Alert | Condition | Severity |
|-------|-----------|----------|
| HighErrorRate | >5% 5xx errors for 5min | Critical |
| ServiceDown | Service unreachable for 1min | Critical |
| HighResponseTime | p95 >2s for 5min | Warning |
| HighMemoryUsage | >256MB for 5min | Warning |
| HighCPUUsage | >80% for 5min | Warning |

### Access

- **Local**: http://localhost:9090
- **K8s**: Port-forward `kubectl port-forward svc/prometheus 9090:9090 -n monitoring`

## Grafana

### Pre-configured Dashboards

#### Smart Hospital Overview
- Service health status (UP/DOWN)
- HTTP request rate per service
- Error rate (4xx, 5xx)
- Response time (p95)
- Active connections
- Memory usage
- CPU usage

### Access

- **Local**: http://localhost:3000
- **Credentials**: admin / admin
- **K8s**: Port-forward `kubectl port-forward svc/grafana 3000:3000 -n monitoring`

### Data Sources

Auto-provisioned:
1. Prometheus (default)
2. Elasticsearch (for log queries)

## ELK Stack

### Elasticsearch
- Log indexing with service-based index pattern
- Index pattern: `logstash-{service}-YYYY.MM.dd`
- Access: http://localhost:9200

### Logstash
- TCP input on port 5044
- JSON parsing and enrichment
- Service-based routing to Elasticsearch
- Configuration: `monitoring/elk/logstash/pipeline/logstash.conf`

### Kibana
- Log search and visualization
- Access: http://localhost:5601
- Create index pattern: `logstash-*`

### Log Format

All services output structured JSON logs:
```json
{
  "timestamp": "2024-01-15 10:30:00",
  "level": "info",
  "service": "patient-service",
  "message": "Retrieved 10 patients (page 1)",
  "environment": "development"
}
```

## Kubernetes Monitoring

### Container Insights
Azure Monitor Container Insights is enabled via Terraform:
- Pod and container metrics
- Node metrics
- Cluster health
- Log Analytics integration

### Prometheus in Kubernetes

Services are annotated for automatic discovery:
```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3001"
  prometheus.io/path: "/metrics"
```

## Health Check Endpoints

Each service exposes:

| Endpoint | Purpose | K8s Probe |
|----------|---------|-----------|
| `/api/v1/health` | Full health status | — |
| `/api/v1/health/live` | Is the process alive? | livenessProbe |
| `/api/v1/health/ready` | Can it accept traffic? | readinessProbe |
