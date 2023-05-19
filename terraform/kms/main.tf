## This resource is intended to create for modules to use
module "ssm-master-kms-key" {
  source = "../modules/kms"

  name                = format("%s-%s", terraform.workspace, "ssm-master-kms-key")
  enable_key_rotation = false

  tags = {
    Name = format("%s-%s", terraform.workspace, "ssm-master-kms-key")
  }
}