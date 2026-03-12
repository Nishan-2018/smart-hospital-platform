# ============================================
# Outputs
# ============================================

output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "Resource group name"
}

output "aks_cluster_name" {
  value       = azurerm_kubernetes_cluster.main.name
  description = "AKS cluster name"
}

output "aks_cluster_id" {
  value       = azurerm_kubernetes_cluster.main.id
  description = "AKS cluster ID"
}

output "acr_login_server" {
  value       = azurerm_container_registry.main.login_server
  description = "ACR login server URL"
}

output "acr_name" {
  value       = azurerm_container_registry.main.name
  description = "ACR name"
}

output "postgresql_server_name" {
  value       = azurerm_postgresql_flexible_server.main.name
  description = "PostgreSQL server name"
}

output "postgresql_fqdn" {
  value       = azurerm_postgresql_flexible_server.main.fqdn
  description = "PostgreSQL FQDN"
  sensitive   = true
}

output "key_vault_name" {
  value       = azurerm_key_vault.main.name
  description = "Key Vault name"
}

output "key_vault_uri" {
  value       = azurerm_key_vault.main.vault_uri
  description = "Key Vault URI"
}

output "log_analytics_workspace_id" {
  value       = azurerm_log_analytics_workspace.main.id
  description = "Log Analytics Workspace ID"
}

output "vnet_id" {
  value       = azurerm_virtual_network.main.id
  description = "Virtual Network ID"
}

output "kube_config" {
  value     = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive = true
}

# Get AKS credentials command
output "get_credentials_command" {
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_kubernetes_cluster.main.name}"
  description = "Command to get AKS credentials"
}
