# Architecture Documentation

## System Architecture

The Smart Hospital Platform follows a **microservices architecture** pattern where each service is:

- Independently deployable
- Loosely coupled
- Organized around business capabilities
- Owned by a small team

## Microservices Overview

### 1. Patient Service
- **Purpose**: Manages patient records (CRUD operations)
- **Technology**: Node.js + Express + Sequelize ORM
- **Database**: PostgreSQL (dedicated instance)
- **Port**: 3001
- **Key Features**:
  - Full CRUD operations
  - Pagination, search, filtering
  - Soft deletes (paranoid mode)
  - Input validation (express-validator)
  - Swagger API documentation

### 2. Appointment Service
- **Purpose**: Schedules and manages doctor appointments
- **Technology**: Node.js + Express + Sequelize ORM
- **Database**: PostgreSQL (dedicated instance)
- **Message Broker**: RabbitMQ (producer)
- **Port**: 3002
- **Key Features**:
  - CRUD operations for appointments
  - Inter-service communication with Patient Service (HTTP)
  - Event publishing to RabbitMQ for notifications
  - Date-range filtering

### 3. Notification Service
- **Purpose**: Sends email/SMS notifications for appointment events
- **Technology**: Node.js + Express + Nodemailer
- **Message Broker**: RabbitMQ (consumer)
- **Port**: 3003
- **Key Features**:
  - Asynchronous event-driven processing
  - RabbitMQ consumer with acknowledgment
  - Email notifications (configurable SMTP)
  - SMS notification stub (Twilio-ready)
  - Dead letter queue support

### 4. AI Prediction Service
- **Purpose**: ML-based patient health risk prediction
- **Technology**: Python + Flask + scikit-learn
- **Port**: 3004
- **Key Features**:
  - Gradient Boosting classifier for sepsis prediction
  - Synthetic data generation for training
  - Risk scoring with clinical recommendations
  - Feature importance analysis
  - Model info and sample data endpoints

## Communication Patterns

### Synchronous (HTTP/REST)
- Appointment Service → Patient Service: Patient verification before booking
- External Clients → All Services: Via Ingress/API Gateway

### Asynchronous (RabbitMQ)
- Appointment Service → RabbitMQ → Notification Service
- Events: appointment.created, appointment.updated, appointment.cancelled
- Topic exchange with routing keys
- Dead letter queue for failed messages

## Data Architecture

### Database per Service
Each service owns its data:
- `patient_db`: Patient records
- `appointment_db`: Appointment records

### Data Isolation
- No shared databases
- Inter-service data access only through APIs
- Eventual consistency through event-driven messaging

## Security Architecture

### Network Security
- Virtual Network isolation
- Network Security Groups (NSG)
- Kubernetes Network Policies (Calico)
- Default deny ingress policy

### Identity & Access
- Azure AD RBAC for AKS
- Kubernetes RBAC (ServiceAccount per app)
- Non-root container execution

### Secrets Management
- Azure Key Vault for secret storage
- CSI Secret Store Driver for K8s integration
- No secrets in code or config files

### API Security
- Rate limiting (100 req/15min)
- Helmet.js security headers
- CORS configuration
- Input validation and sanitization
- TLS termination at ingress

## Scalability

### Horizontal Pod Autoscaling (HPA)
- CPU-based autoscaling (target: 70%)
- Memory-based autoscaling (target: 80%)
- Min/Max replica bounds per service

### AKS Cluster Autoscaling
- Node pool autoscaling (1-10 nodes)
- VM size configurable per environment

### Database Scaling
- PostgreSQL Flexible Server with configurable SKU
- Connection pooling in application layer
