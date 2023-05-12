# ========================================
# Security Group
# ========================================

data "aws_security_group" "alpha" {
  name = "product-alpha-sg"
}

data "aws_security_group" "alpha-rds" {
  name = format("%s-db-%s-%s", terraform.workspace, "postgres", "alpha")
}

# ========================================
# VPC
# ========================================

data "aws_vpc" "beta" {
  id = var.vpc-id["beta"]
}

# ========================================
# Subnet
# ========================================

data "aws_subnets" "beta-app" {

  filter {
    name   = "vpc-id"
    values = [var.vpc-id["beta"]]
  }

  filter {
    name   = "tag:Tier"
    values = ["app"]
  }

  filter {
    name   = "tag:Environment"
    values = [terraform.workspace]
  }
}