# CI/CD Pipeline Documentation

## Overview

The Smart Hospital Platform uses GitHub Actions for continuous integration and continuous deployment. The pipeline is designed for reliability, security, and multi-environment support.

## Pipeline Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Source     │────▶│  Build &    │────▶│   Static     │────▶│  Security   │
│  Checkout   │     │   Test      │     │  Analysis    │     │   Scan      │
│             │     │ (Jest/Pytest)│     │ (SonarQube)  │     │  (Trivy)    │
└─────────────┘     └─────────────┘     └──────────────┘     └──────┬──────┘
                                                                     │
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────▼──────┐
│   Deploy    │◀────│  Push to    │◀────│   Docker     │◀────│  Security   │
│   to K8s    │     │    ACR      │     │   Build      │     │   Passed    │
└─────────────┘     └─────────────┘     └──────────────┘     └─────────────┘
```

## Pipeline Files

### 1. `ci-cd-pipeline.yml` — Main Application Pipeline

**Triggers:**
- Push to `main`, `develop`, `release/*`
- Pull requests to `main`, `develop`

**Jobs:**

| Job | Purpose | Runs On |
|-----|---------|---------|
| `build-and-test` | Install deps, lint, unit test (Node.js services) | Matrix: 3 services |
| `build-and-test-ai` | Install deps, pytest (Python service) | Single runner |
| `code-analysis` | SonarQube static analysis | After tests pass |
| `security-scan` | Trivy container + filesystem scan | Matrix: 4 services |
| `docker-build-push` | Build multi-stage Docker images, push to ACR | After security passes |
| `deploy-dev` | Deploy to dev AKS cluster | On `develop` branch |
| `deploy-staging` | Deploy to staging AKS cluster | On `release/*` branches |
| `deploy-production` | Deploy to production AKS cluster | On `main` branch |

### 2. `terraform-pipeline.yml` — Infrastructure Pipeline

**Triggers:**
- Push to `main` (infrastructure/ path)
- Manual dispatch with environment and action selection

**Actions:**
- `terraform init` → `validate` → `fmt check` → `plan` → `apply/destroy`

## Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `ACR_LOGIN_SERVER` | Azure Container Registry URL |
| `ACR_USERNAME` | ACR service principal client ID |
| `ACR_PASSWORD` | ACR service principal password |
| `AKS_CLUSTER_NAME` | AKS cluster name |
| `AKS_RESOURCE_GROUP` | AKS resource group |
| `AZURE_CREDENTIALS` | Azure service principal JSON |
| `SONAR_TOKEN` | SonarQube authentication token |
| `SONAR_HOST_URL` | SonarQube server URL |
| `ARM_CLIENT_ID` | Azure SP client ID (Terraform) |
| `ARM_CLIENT_SECRET` | Azure SP client secret (Terraform) |
| `ARM_SUBSCRIPTION_ID` | Azure subscription ID |
| `ARM_TENANT_ID` | Azure tenant ID |

## Branching Strategy

```
main (production)
├── release/1.0 (staging)
│   └── develop (dev)
│       ├── feature/patient-crud
│       ├── feature/appointment-api
│       └── bugfix/fix-validation
```

## Deployment Strategy

- **Rolling Update**: Zero-downtime deployments with `maxSurge: 1, maxUnavailable: 0`
- **Helm**: All deployments use Helm charts with environment-specific values
- **Image Tags**: `{branch}-{sha}` format for traceability
- **Rollback**: `helm rollback smart-hospital` for instant rollback
