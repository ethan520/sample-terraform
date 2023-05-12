locals {
  # postgres
  db-version = {
    dev = "15.2"
    stg = "14.7"
    prd = "14.7"
  }

  db-snapshot-identifier = {
    dev = null
    stg = null
    prd = null
  }

  db-security-group-rules = concat([{
      type                     = "ingress"
      from_port                = 5432
      to_port                  = 5432
      protocol                 = "tcp"
      source_security_group_id = module.product_beta_sg.security-group.id ## beta service to access rds
      description              = format("Allow traffic to database on port 5432 from %s", local.service-name)
    }, {
      type                     = "ingress"
      from_port                = 5432
      to_port                  = 5432
      protocol                 = "tcp"
      source_security_group_id = data.aws_security_group.alpha-rds.id ## alpha service to access rds
      description              = "Allow traffic to database on port 5432 from Alpha"
    }])
}

## ========================================
## RDS
## ========================================

module "project_beta_rds" {
  source = "../modules/rds"

  service-name  = "db_proj_beta"
  environment   = terraform.workspace

  # Load from snapshot during migration, on specifying snapshot id pass respective kms key used to copy snapshot.
  snapshot-identifier = local.db-snapshot-identifier[terraform.workspace]

  # Database and engine details
  engine             = "postgres"
  engine-version     = local.db-version[terraform.workspace]
  db-name            = "db"
  instance-class     = var.db-instance-type[terraform.workspace]
  storage-allocation = var.db-storage-allocation[terraform.workspace]

  # Database credentials
  master-username   = "admin"

  # Backup & Maintenance
  apply_immediately = false
  skip-final-snapshot     = terraform.workspace == "prd" ? "false" : "true"
  backup-retention-period = terraform.workspace == "prd" ? 14 : 7

  # Configuration
  allow-auto-minor-version-upgrade = true
  deletion-protection  = true
  parameter-group-name = aws_db_parameter_group.beta.id
  vpc-id               = var.vpc-id["beta"]
  security-group-rules = local.db-security-group-rules
  multi-az             = false

  # Database encryption
  storage-encrypted = true
  kms-key-id        = module.beta-rds-kms-key.arn

  # Logging
  enabled-cloudwatch-logs-exports = ["postgresql", "upgrade"]
  retention-in-days               = terraform.workspace == "prd" ? 365 : 7
}

## ========================================
## KMS KEY
## ========================================

module "beta-rds-kms-key" {
  source = "../modules/kms"

  name                = format("%s-%s", terraform.workspace, "beta-rds-kms-key")
  enable_key_rotation = false

  tags = {
    Name = format("%s-%s", terraform.workspace, "beta-rds-kms-key")
  }
}

## ========================================
## PARAM GROUP
## ========================================

resource "aws_db_parameter_group" "beta" {
  name   = "my-pg"
  family = "postgres14"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "rds.log_retention_period"
    value = 1440 # 1 day
  }

  lifecycle {
    create_before_destroy = true
  }
}