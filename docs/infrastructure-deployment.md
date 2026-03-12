# Infrastructure Deployment Guide

## Overview

All infrastructure is defined as code using Terraform and provisioned on Microsoft Azure.

## Prerequisites

1. Azure subscription with sufficient permissions
2. Azure CLI installed and authenticated
3. Terraform >= 1.5.0 installed
4. Service Principal for automation

## Create Service Principal

```bash
# Create SP with Contributor role
az ad sp create-for-rbac \
  --name "sp-smart-hospital-terraform" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID> \
  --sdk-auth
```

## Setup Remote State

```bash
# Create resource group for state
az group create --name terraform-state-rg --location eastus

# Create storage account
az storage account create \
  --name tfstatesmarthospital \
  --resource-group terraform-state-rg \
  --sku Standard_LRS \
  --encryption-services blob

# Create container
az storage container create \
  --name tfstate \
  --account-name tfstatesmarthospital
```

## Provision Infrastructure

### Step 1: Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

### Step 2: Configure Variables

Edit the appropriate environment file:
- `environments/dev.tfvars` — Development
- `environments/staging.tfvars` — Staging
- `environments/production.tfvars` — Production

Replace placeholders:
- `YOUR_SUBSCRIPTION_ID`
- `YOUR_TENANT_ID`
- `CHANGE_ME_SECURE_PASSWORD`

### Step 3: Plan and Apply

```bash
# Dev environment
terraform plan -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars

# Staging environment
terraform plan -var-file=environments/staging.tfvars
terraform apply -var-file=environments/staging.tfvars

# Production environment
terraform plan -var-file=environments/production.tfvars
terraform apply -var-file=environments/production.tfvars
```

### Step 4: Get AKS Credentials

```bash
az aks get-credentials \
  --resource-group rg-smart-hospital-dev \
  --name aks-smart-hospital-dev
```

## Provisioned Resources

### Per Environment

| Resource | Dev | Staging | Production |
|----------|-----|---------|------------|
| AKS Nodes | 1-3 (D2s_v3) | 2-4 (D2s_v3) | 3-10 (D4s_v3) |
| ACR SKU | Standard | Standard | Premium |
| PostgreSQL | B_Standard_B1ms | GP_Standard_D2s_v3 | GP_Standard_D4s_v3 |
| Storage | 32 GB | 32 GB | 64 GB |
| Backup Retention | 7 days | 7 days | 35 days |
| Geo-Redundant Backup | No | No | Yes |
| Log Retention | 30 days | 30 days | 90 days |

## Destroy Infrastructure

```bash
terraform destroy -var-file=environments/dev.tfvars
```

## Cost Estimation

| Environment | Estimated Monthly Cost |
|-------------|----------------------|
| Dev | ~$150-200 |
| Staging | ~$300-400 |
| Production | ~$800-1200 |

*Costs vary based on usage and Azure pricing.*
