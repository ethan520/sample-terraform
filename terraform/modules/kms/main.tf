resource "aws_kms_key" "default" {
  description         = format("KMS key for %s", var.name)
  policy              = var.policy
  enable_key_rotation = var.enable_key_rotation

  tags = {
    Name = var.name
  }
}

resource "aws_kms_alias" "default" {
  name          = format("alias/%s", var.name)
  target_key_id = aws_kms_key.default.key_id
}
