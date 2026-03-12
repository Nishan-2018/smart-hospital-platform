# Development Environment
subscription_id    = "9ddc0128-804d-4770-8592-bdf986ab5711"
tenant_id          = "810c5dcc-4459-4053-aad3-67ca4b51fd45"
environment        = "dev"
location           = "Central India"
project_name       = "smart-hospital"

# AKS
kubernetes_version = "1.28.3"
aks_node_count     = 2
aks_node_vm_size   = "Standard_D2s_v3"
aks_max_node_count = 3
aks_min_node_count = 1

# Network
vnet_address_space = ["10.0.0.0/16"]
aks_subnet_cidr    = "10.0.1.0/24"
db_subnet_cidr     = "10.0.2.0/24"

# Database
db_admin_login     = "hospitaladmin"
db_admin_password  = "SmartHospital@123"
db_sku_name        = "B_Standard_B1ms"