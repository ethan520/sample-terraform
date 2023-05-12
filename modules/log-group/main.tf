resource "aws_cloudwatch_log_group" "default" {
  name              = var.name
  retention_in_days = var.retention-in-days
  kms_key_id        = var.kms-key-id
  tags              = var.tags
}