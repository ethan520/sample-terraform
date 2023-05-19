## Assuming the db subnet group is created for this use case
## To ensure that the RDS instances are created in the specified subnets, enabling them to communicate securely within the VPC.
data "aws_db_subnet_group" "default" {
  name = format("%s-db_subnet_group", var.environment)
}

# Assuming the default kms key is created
data "aws_kms_alias" "ssm-master" {
  name = format("alias/%s-ssm-master-kms-key", var.environment)
}
