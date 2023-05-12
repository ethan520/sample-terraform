variable "service-name" {
  type        = string
  description = "Required. Service name for which RDS is created."
}

variable "master-username" {
  type        = string
  description = "Required. Admin username for RDS."
}

variable "rotate-password" {
  type        = bool
  default     = false
  description = "Optional. Update password for RDS."
}

variable "db-name" {
  type        = string
  description = "Required. Database name for the RDS."
}

variable "engine-version" {
  type        = string
  description = "Required. Database engine version for the RDS."
}

variable "engine" {
  type        = string
  description = "Required. Database engine type RDS."
}

variable "kms-key-id" {
  type        = string
  default     = ""
  description = "Optional. DB kms key id for RDS."
}

variable "instance-class" {
  type        = string
  description = "Required. DB instance class for the RDS."
}

variable "environment" {
  type        = string
  description = "Required. Environment for the RDS."
}

variable "vpc-id" {
  type        = string
  description = "Required. ID of the VPC the RDS sg is to be created in"
}

variable "security-group-rules" {
  type        = list(any)
  description = "Required. Rules for the security group the db is to be created with"
}

variable "multi-az" {
  type        = string
  default     = ""
  description = "Optional. Multi availability zones for RDS."
}

variable "availability-zone" {
  type        = string
  default     = null
  description = "Optional. Availability zones for RDS."
}

variable "skip-final-snapshot" {
  default     = ""
  description = "Optional. Skip final snapshot identified for RDS."
}

variable "override-password" {
  type        = string
  default     = null
  description = "Optional. This will pass the password to be used for RDS."
}

variable "snapshot-identifier" {
  type        = string
  default     = ""
  description = "Optional. Snapshot id from which RDS instance is created."
}

variable "parameter-group-name" {
  type        = string
  default     = ""
  description = "Optional. Parameter group for RDS."
}

variable "backup-retention-period" {
  type        = string
  default     = ""
  description = "Optional. Backup retention period for RDS."
}

variable "enabled-cloudwatch-logs-exports" {
  type        = list(any)
  default     = []
  description = "Optional. Enable cloud watch logs for RDS."
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Optional. Tags of the resource."
}

variable "allow-major-version-upgrade" {
  type        = bool
  default     = null
  description = "Optional. Defaults to false"
}

variable "allow-auto-minor-version-upgrade" {
  type        = bool
  default     = null
  description = "Optional. Defaults to false"
}

variable "storage-encrypted" {
  type        = bool
  default     = null
  description = "Optional. Defaults to false"
}

variable "storage-allocation" {
  type        = string
  description = "Required. Storage allocated for RDS"
}

variable "deletion-protection" {
  type        = bool
  default     = null
  description = "Optional. Defaults to false"
}

variable "retention-in-days" {
  type        = number
  default     = 7
  description = "Optional. Defaults to 7 days"
}

variable "apply_immediately" {
  type        = bool
  description = "Required. Sets whether database changes should be applied immediately or during maintenance"
}

## Depends on the workload pattern, avoid set during peak hours
variable "maintenance_window" {
  type        = string
  default     = "Sat:20:00-Sat:23:00"
  description = "Optional. Defaults to every Saturday, 2000-2300 UTC."
}

