output "arn" {
  value = aws_kms_key.default.arn
}

output "id" {
  value = aws_kms_key.default.key_id
}
