# providers
provider "aws" {
  region = "ap-southeast-1"
}

# settings
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 4.66.0"
    }
  }

  backend "s3" {
    bucket = "tfstate-general-s3-bucket"
    key    = "np-s3-tfstate"
    region = "ap-southeast-1"
  }
}

terraform {
  required_version = "= 1.0.2"
}

data "aws_caller_identity" "current" {}