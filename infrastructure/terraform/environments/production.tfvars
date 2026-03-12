# Production Environment
subscription_id    = "YOUR_SUBSCRIPTION_ID"
tenant_id          = "YOUR_TENANT_ID"
environment        = "production"
location           = "East US"
project_name       = "smart-hospital"

# AKS
kubernetes_version = "1.28.3"
aks_node_count     = 3
aks_node_vm_size   = "Standard_D4s_v3"
aks_max_node_count = 10
aks_min_node_count = 3

# Network
vnet_address_space = ["10.0.0.0/16"]
aks_subnet_cidr    = "10.0.1.0/24"
db_subnet_cidr     = "10.0.2.0/24"

# Database
db_admin_login    = "hospitaladmin"
db_admin_password = "CHANGE_ME_SECURE_PASSWORD"
db_sku_name       = "GP_Standard_D4s_v3"
