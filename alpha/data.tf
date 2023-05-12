# ========================================
# Security Group
# ========================================

# Security group of beta service
data "aws_security_group" "beta" {
  name = "product-beta-sg"
}

# Security group of beta rds
data "aws_security_group" "beta-rds" {
  name = format("%s-db-%s-%s", terraform.workspace, "postgres", "beta")
}

# ========================================
# VPC
# ========================================

# Alpha VPC id
data "aws_vpc" "alpha" {
  id = var.vpc-id["alpha"]
}

# ========================================
# Subnet
# ========================================

# App subnet in alpha
data "aws_subnets" "alpha-app" {

  filter {
    name   = "vpc-id"
    values = [var.vpc-id["alpha"]]
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