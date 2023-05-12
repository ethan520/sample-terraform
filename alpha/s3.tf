locals {
  s3-bucket-name = "s3_proj_alpha"
}

module "proj_alpha_bucket" {
  source = "../modules/s3"

  name = format("%s-%s-bucket", terraform.workspace, local.s3-bucket-name)
  log-target-bucket = format("%s-%s", terraform.workspace, "logs-bucket")
  log-target-prefix = format("%s/%s/logs", terraform.workspace, local.s3-bucket-name)
  sse-algorithm = "aes256"
  versioning_status = "Enabled"

  tags = {
    Name = format("%s-%s-s3-bucket", terraform.workspace, local.s3-bucket-name)
  }
}