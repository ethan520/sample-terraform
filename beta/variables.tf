# ========================================
# RDS
# ========================================

variable "db-storage-allocation" {
  default = {
    dev = 5
    stg = 5
    prd = 40
  }
}

variable "db-instance-type" {
  default = {
    dev = "db.t3.micro"
    stg = "db.t3.micro"
    prd = "db.t3.small"
  }
}

# ========================================
# VPC
# ========================================

variable "vpc-id" {
  default = {
    alpha = "vpc-123456789"
    beta = "vpc-987654321"
  }
}