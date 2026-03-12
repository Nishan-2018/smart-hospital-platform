# 🏥 Smart Hospital Platform

## Cloud-Native Healthcare System | Enterprise DevOps Demonstration

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/smart-hospital-platform/actions/workflows/ci-cd-pipeline.yml/badge.svg)](https://github.com/YOUR_USERNAME/smart-hospital-platform/actions)
[![Terraform](https://github.com/YOUR_USERNAME/smart-hospital-platform/actions/workflows/terraform-pipeline.yml/badge.svg)](https://github.com/YOUR_USERNAME/smart-hospital-platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Overview

The **Smart Hospital Platform** is a cloud-native, microservices-based healthcare system designed to demonstrate enterprise-grade DevOps practices used in large healthcare organizations like **HCA Healthcare**. It features patient management, appointment scheduling, async notifications, and AI-based health risk prediction.

### Key Highlights

- 🏗️ **Microservices Architecture** — 4 independent services with REST APIs
- 🐳 **Containerized** — Multi-stage Docker builds with security best practices
- ☸️ **Kubernetes Orchestration** — Helm charts, HPA, RBAC, network policies
- 🏗️ **Infrastructure as Code** — Terraform for AKS, ACR, VNet, PostgreSQL, Key Vault
- 🔄 **CI/CD Pipeline** — GitHub Actions with 7 automated stages
- 📊 **Full Observability** — Prometheus, Grafana dashboards, ELK stack
- 🔒 **DevSecOps** — Trivy scanning, SonarQube, RBAC, secrets management
- 🤖 **AI/ML** — Sepsis risk prediction using Gradient Boosting

---

## 🏛️ Architecture

```
                                    ┌─────────────────────────────────────────┐
                                    │              NGINX Ingress              │
                                    │          (TLS, Rate Limiting)           │
                                    └──────────┬───────┬───────┬─────────────┘
                                               │       │       │
                    ┌──────────────────────────┐│       │       │┌──────────────────────┐
                    │                          ││       │       ││                      │
              ┌─────▼──────┐            ┌──────▼──┐   ┌▼───────▼──┐           ┌────────▼───────┐
              │  Patient   │            │Appoint- │   │Notifica-  │           │  AI Prediction │
              │  Service   │◄───────────│  ment   │   │   tion    │           │    Service     │
              │ (Node.js)  │  HTTP      │ Service │   │  Service  │           │   (Python)     │
              └─────┬──────┘            └────┬────┘   └─────┬─────┘           └────────────────┘
                    │                        │              │
              ┌─────▼──────┐          ┌─────▼──────┐  ┌────▼─────┐
              │ PostgreSQL │          │ PostgreSQL │  │ RabbitMQ │
              │ (Patient)  │          │(Appointm.) │  │ (Events) │
              └────────────┘          └────────────┘  └──────────┘
                    
              ┌──────────────────────────────────────────────────┐
              │              Monitoring & Observability          │
              │  ┌──────────┐  ┌─────────┐  ┌────────────────┐  │
              │  │Prometheus│  │ Grafana │  │ ELK Stack      │  │
              │  │ (Metrics)│  │(Dashboard│  │(Logging)       │  │
              │  └──────────┘  └─────────┘  └────────────────┘  │
              └──────────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
smart-hospital-platform/
├── microservices/
│   ├── patient-service/          # Patient CRUD (Node.js + PostgreSQL)
│   ├── appointment-service/      # Scheduling (Node.js + PostgreSQL + RabbitMQ)
│   ├── notification-service/     # Async notifications (Node.js + RabbitMQ)
│   └── ai-prediction-service/   # ML Risk Prediction (Python + scikit-learn)
├── infrastructure/
│   └── terraform/                # AKS, ACR, VNet, PostgreSQL, Key Vault
│       └── environments/         # dev, staging, production configs
├── kubernetes/
│   └── base/                     # K8s manifests (deployments, services, ingress, RBAC)
├── helm/
│   └── smart-hospital/           # Helm chart for deployment
├── monitoring/
│   ├── prometheus/               # Prometheus config + alert rules
│   ├── grafana/                  # Dashboards + provisioning
│   └── elk/                      # Logstash pipeline + config
├── security/                     # Security policies, secrets management
├── .github/workflows/            # GitHub Actions CI/CD pipelines
├── docs/                         # Full documentation
├── docker-compose.yml            # Local development stack
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- kubectl (for K8s deployment)
- Terraform 1.5+ (for infrastructure)
- Azure CLI (for cloud deployment)

### Run Locally with Docker Compose

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/smart-hospital-platform.git
cd smart-hospital-platform

# Start all services
docker-compose up --build

# Services will be available at:
# Patient Service:       http://localhost:3001
# Appointment Service:   http://localhost:3002
# Notification Service:  http://localhost:3003
# AI Prediction Service: http://localhost:3004
# RabbitMQ Management:   http://localhost:15672 (guest/guest)
# Prometheus:            http://localhost:9090
# Grafana:               http://localhost:3000 (admin/admin)
# Kibana:                http://localhost:5601
```

### Run Individual Services (Development)

```bash
# Patient Service
cd microservices/patient-service
cp .env.example .env
npm install
npm run dev

# AI Prediction Service
cd microservices/ai-prediction-service
pip install -r requirements.txt
python src/app.py
```

---

## 📡 API Endpoints

### Patient Service (Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/patients` | List all patients (paginated) |
| GET | `/api/v1/patients/:id` | Get patient by ID |
| POST | `/api/v1/patients` | Create new patient |
| PUT | `/api/v1/patients/:id` | Update patient |
| DELETE | `/api/v1/patients/:id` | Soft delete patient |
| PATCH | `/api/v1/patients/:id/status` | Update patient status |
| GET | `/api/v1/health` | Health check |

### Appointment Service (Port 3002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/appointments` | List appointments |
| GET | `/api/v1/appointments/:id` | Get appointment |
| POST | `/api/v1/appointments` | Create appointment |
| PUT | `/api/v1/appointments/:id` | Update appointment |
| DELETE | `/api/v1/appointments/:id` | Cancel appointment |
| GET | `/api/v1/appointments/patient/:patientId` | Patient's appointments |
| PATCH | `/api/v1/appointments/:id/status` | Update status |

### AI Prediction Service (Port 3004)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/predict/sepsis` | Predict sepsis risk |
| GET | `/api/v1/predict/model-info` | Get model information |
| GET | `/api/v1/predict/sample` | Get sample test data |

### Sample API Calls

```bash
# Create a patient
curl -X POST http://localhost:3001/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1985-03-15",
    "gender": "male",
    "email": "john.doe@example.com",
    "phone": "+12025551234",
    "bloodType": "O+",
    "insuranceProvider": "Blue Cross"
  }'

# Predict sepsis risk
curl -X POST http://localhost:3004/api/v1/predict/sepsis \
  -H "Content-Type: application/json" \
  -d '{
    "heart_rate": 115,
    "respiratory_rate": 28,
    "temperature": 39.2,
    "wbc_count": 18,
    "systolic_bp": 85,
    "diastolic_bp": 50,
    "oxygen_saturation": 90,
    "age": 70,
    "lactate_level": 4.5,
    "creatinine": 2.5
  }'
```

---

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline includes **7 automated stages**:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Source   │───▶│  Build   │───▶│   Unit   │───▶│  Static  │
│ Checkout │    │          │    │  Tests   │    │ Analysis │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌─────▼────┐
│  Deploy  │◀───│   Push   │◀───│  Docker  │◀───│ Security │
│   K8s    │    │   ACR    │    │  Build   │    │   Scan   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Pipeline Stages

1. **Source Checkout** — Clone repository
2. **Build & Test** — Install dependencies, run unit tests
3. **Static Analysis** — SonarQube code quality scan
4. **Security Scan** — Trivy vulnerability scanning (container + filesystem)
5. **Docker Build** — Multi-stage Docker image build
6. **Push to ACR** — Push images to Azure Container Registry
7. **Deploy to K8s** — Helm-based deployment to AKS

### Multi-Environment Support

| Branch | Deploys To | Approval |
|--------|-----------|----------|
| `develop` | Dev | Auto |
| `release/*` | Staging | Auto |
| `main` | Production | Manual |

---

## 🏗️ Infrastructure (Terraform)

### Provisioned Resources

| Resource | Description |
|----------|-------------|
| Azure Kubernetes Service (AKS) | Managed K8s with autoscaling, RBAC, Calico network policy |
| Azure Container Registry (ACR) | Private Docker registry (geo-replicated in prod) |
| Virtual Network (VNet) | Isolated network with AKS and DB subnets |
| PostgreSQL Flexible Server | Managed database with private DNS |
| Azure Key Vault | Secrets management with AKS integration |
| Log Analytics Workspace | Container Insights monitoring |

### Deploy Infrastructure

```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan for specific environment
terraform plan -var-file=environments/dev.tfvars

# Apply
terraform apply -var-file=environments/dev.tfvars
```

---

## 📊 Monitoring & Observability

### Prometheus
- Scrapes metrics from all 4 microservices
- Alert rules for error rates, response times, resource usage
- 15-second scrape interval

### Grafana Dashboards
- **Service Health Overview** — UP/DOWN status for all services
- **HTTP Request Rate** — Requests per second per service
- **Error Rate** — 4xx and 5xx error tracking
- **Response Time** — p95 latency
- **Resource Usage** — Memory and CPU per service

### ELK Stack
- **Elasticsearch** — Log storage and indexing
- **Logstash** — Log parsing and enrichment pipeline
- **Kibana** — Log visualization and search

---

## 🔒 Security

### DevSecOps Practices

| Practice | Tool | Description |
|----------|------|-------------|
| Container Scanning | Trivy | Scans Docker images for vulnerabilities |
| Code Analysis | SonarQube | Static code analysis and quality gates |
| Secrets Management | Azure Key Vault | Secure secret storage with K8s CSI driver |
| RBAC | Kubernetes | Role-based access control policies |
| Network Policies | Calico | Pod-level network segmentation |
| Pod Security | PSS (Restricted) | Pod Security Standards enforcement |
| Non-root Containers | Docker | All services run as non-root users |
| TLS | cert-manager | Automatic TLS certificate management |

---

## 🧪 Testing

```bash
# Node.js services
cd microservices/patient-service
npm test

# Python AI service
cd microservices/ai-prediction-service
pytest tests/ -v --cov=src
```

---

## 📝 Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js (Express), Python (Flask) |
| Database | PostgreSQL |
| Message Broker | RabbitMQ |
| ML Framework | scikit-learn |
| Container Runtime | Docker |
| Orchestration | Kubernetes (AKS) |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| Container Registry | Azure Container Registry |
| Monitoring | Prometheus + Grafana |
| Logging | ELK Stack |
| Security | Trivy, SonarQube, Azure Key Vault |

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**HCA DevOps Engineering Team**

*Smart Hospital Platform — Demonstrating production-grade DevOps practices for healthcare at scale.*
