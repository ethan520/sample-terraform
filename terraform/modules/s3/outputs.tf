output "name" {
  value = aws_s3_bucket.default.id
}

output "arn" {
  value = aws_s3_bucket.default.arn
}

output "domain_name" {
  value = aws_s3_bucket.default.bucket_domain_name
}

output "regional_domain_name" {
  value = aws_s3_bucket.default.bucket_regional_domain_name
}