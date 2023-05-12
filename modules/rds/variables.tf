# Variables
## Default tags
variable "zone" {
  default = "ez"
}

# change tier
variable "tier" {
  default = "db"
}

variable "backup-window" {
  default = "18:00-19:00"
}

variable "ca-cert-version" {
  default = "rds-ca-2019"
}

variable "db-pass" {
  default = "defaultP@ssw0rd"
}

locals {
  tags = {
    Environment   = var.environment
    Zone          = var.zone
  }
}
