# Local Development & Cloud Deployment Guide

## Local Development

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Docker | 24.x |
| Docker Compose | 2.x |
| Node.js | 20.x |
| Python | 3.11 |
| npm | 10.x |
| pip | 23.x |

### Option 1: Docker Compose (Recommended)

```bash
# Start everything
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and remove data volumes
docker-compose down -v
```

### Option 2: Run Services Individually

**Start Infrastructure:**
```bash
# Start only databases and RabbitMQ
docker-compose up -d patient-db appointment-db rabbitmq
```

**Patient Service:**
```bash
cd microservices/patient-service
cp .env.example .env
npm install
npm run dev  # Starts with nodemon on port 3001
```

**Appointment Service:**
```bash
cd microservices/appointment-service
npm install
npm run dev  # Starts on port 3002
```

**Notification Service:**
```bash
cd microservices/notification-service
npm install
npm run dev  # Starts on port 3003
```

**AI Prediction Service:**
```bash
cd microservices/ai-prediction-service
pip install -r requirements.txt
python src/app.py  # Starts on port 3004
```

### Running Tests

```bash
# Node.js service tests
cd microservices/patient-service
npm test

# Python service tests
cd microservices/ai-prediction-service
pytest tests/ -v --cov=src
```

---

## Cloud Deployment (Azure)

### Prerequisites

| Tool | Purpose |
|------|---------|
| Azure CLI | Azure resource management |
| Terraform | Infrastructure provisioning |
| kubectl | Kubernetes management |
| Helm | K8s package management |

### Step 1: Provision Infrastructure

```bash
# Login to Azure
az login

# Provision infrastructure
cd infrastructure/terraform
terraform init
terraform apply -var-file=environments/dev.tfvars
```

### Step 2: Connect to AKS

```bash
az aks get-credentials \
  --resource-group rg-smart-hospital-dev \
  --name aks-smart-hospital-dev
```

### Step 3: Configure Secrets

```bash
# Create namespace
kubectl apply -f kubernetes/base/namespace.yaml

# Create secrets (replace with actual values)
kubectl create secret generic patient-db-secret \
  --namespace smart-hospital \
  --from-literal=host=<POSTGRESQL_FQDN> \
  --from-literal=username=hospitaladmin \
  --from-literal=password=<PASSWORD>

kubectl create secret generic appointment-db-secret \
  --namespace smart-hospital \
  --from-literal=host=<POSTGRESQL_FQDN> \
  --from-literal=username=hospitaladmin \
  --from-literal=password=<PASSWORD>

kubectl create secret generic rabbitmq-secret \
  --namespace smart-hospital \
  --from-literal=url=amqp://guest:guest@rabbitmq:5672
```

### Step 4: Deploy with Helm

```bash
helm upgrade --install smart-hospital ./helm/smart-hospital \
  --namespace smart-hospital \
  --create-namespace \
  --set global.environment=dev \
  --set image.registry=<ACR_LOGIN_SERVER> \
  --wait
```

### Step 5: Verify Deployment

```bash
# Check pods
kubectl get pods -n smart-hospital

# Check services
kubectl get svc -n smart-hospital

# Check ingress
kubectl get ingress -n smart-hospital

# View logs
kubectl logs -f deployment/patient-service -n smart-hospital
```

### Step 6: Deploy Monitoring

```bash
# Install Prometheus (via Helm)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace

# Port forward Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
```

---

## Useful Commands

```bash
# Scale a service
kubectl scale deployment patient-service --replicas=3 -n smart-hospital

# Rolling restart
kubectl rollout restart deployment/patient-service -n smart-hospital

# View HPA status
kubectl get hpa -n smart-hospital

# Rollback
helm rollback smart-hospital 1

# Resource usage
kubectl top pods -n smart-hospital
```
