resource "aws_db_instance" "default" {
  apply_immediately           = var.apply_immediately
  allow_major_version_upgrade = var.allow-major-version-upgrade

  identifier          = format("%s-%s", var.environment, var.service-name)
  engine              = var.engine
  ca_cert_identifier  = var.ca-cert-version
  engine_version      = var.engine-version
  publicly_accessible = false

  # Sizing
  instance_class    = var.instance-class
  allocated_storage = var.storage-allocation

  # Database basic information
  snapshot_identifier = var.snapshot-identifier
  db_name             = var.db-name
  username            = var.username.value
  password            = random_password.new_password.result # random password will be generated and apply to the rds instance

  # Configuration
  vpc_security_group_ids = [module.security-group.id]
  parameter_group_name   = var.parameter-group-name
  db_subnet_group_name   = data.aws_db_subnet_group.default.name
  multi_az               = var.multi-az

  iam_database_authentication_enabled = true

  # Backup & Maintenance
  final_snapshot_identifier  = format("%s-%s-final-snapshot", var.environment, var.service-name)
  skip_final_snapshot        = var.skip-final-snapshot # Optional, whether you wanna take the snapshot before delete the db
  backup_retention_period    = var.backup-retention-period
  backup_window              = var.backup-window
  maintenance_window         = var.maintenance_window
  auto_minor_version_upgrade = var.allow-auto-minor-version-upgrade
  deletion_protection        = var.deletion-protection
  
  # Database encryption
  storage_encrypted = var.storage-encrypted
  kms_key_id        = var.kms-key-id

  # Logging
  enabled_cloudwatch_logs_exports = var.enabled-cloudwatch-logs-exports

  # Tags
  tags = {
    Name = format("%s-%s", var.environment, var.service-name)
    Tier = "db"
  }
}

## ========================================
## SECURITY GROUP
## ========================================

module "security-group" {
  source = "../security-group"

  vpc-id                = var.vpc-id
  name                  = format("%s-db-%s-%s", var.environment, var.engine, var.service-name)
  description           = format("Allow traffic to %s %s", var.engine, var.service-name)

  tags = {
    Name = format("%s-%s", var.environment, var.service-name)
  }

  rules = var.security-group-rules
}

## ========================================
## SSM PARAMS
## ========================================

resource "aws_ssm_parameter" "username" {

  name      = format("/%s/%s/%s/USERNAME", var.environment, var.engine, var.service-name)
  type      = "String"
  value     = var.master-username
  overwrite = true

  tags = {
    Name = format("%s-%s", var.environment, var.service-name)
  }
}

resource "aws_ssm_parameter" "password" {
  name      = format("/%s/%s/%s/PASSWORD", var.environment, var.engine, var.service-name)
  type      = "SecureString"
  value     = var.override-password == null ? random_password.rds_master_password.result : var.override-password
  key_id    = data.aws_kms_alias.ssm-master.name
  overwrite = true

  tags = {
    Name = format("%s-%s", var.environment, var.service-name)
  }
}

resource "aws_ssm_parameter" "db-host" {
  name      = format("/%s/service/%s/app/DB_HOST", terraform.workspace, var.service-name)
  type      = "String"
  value     = aws_db_instance.default.address
  overwrite = true

  tags = {
    Name = format("/%s/service/%s/app/DB_HOST", terraform.workspace, var.service-name)
  }
}

resource "aws_ssm_parameter" "db-port" {
  name      = format("/%s/service/%s/app/DB_PORT", terraform.workspace, var.service-name)
  type      = "String"
  value     = aws_db_instance.default.port
  overwrite = true

  tags = {
    Name = format("/%s/service/%s/app/DB_PORT", terraform.workspace, var.service-name)
  }
}

## ========================================
## CREDS
## ========================================

resource "random_password" "rds_master_password" {
  length           = 20
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

## ========================================
## LOG GROUP
## ========================================

module "default" {
  source = "../log-group"

  name              = format("/aws/rds/instance/%s-%s/%s", var.environment, var.service-name, var.engine == "postgres" ? "postgresql" : "audit")
  retention-in-days = var.retention-in-days

  tags = {
    Name = format("/aws/rds/instance/%s-%s/%s", var.environment, var.service-name, var.engine == "postgres" ? "postgresql" : "audit")
  }
}