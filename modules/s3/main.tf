## Create S3 bucket
resource "aws_s3_bucket" "default" {
  bucket        = var.name
  tags          = var.tags
  force_destroy = var.force-destroy
}

## Define the bucket ACL
resource "aws_s3_bucket_acl" "default" {
  bucket = aws_s3_bucket.default.id
  acl    = var.acl-type
}

# ========================================
# Public access block
# ========================================

resource "aws_s3_bucket_public_access_block" "default" {
  bucket = aws_s3_bucket.default.id

  block_public_acls       = true
  block_public_policy     = true
  restrict_public_buckets = true
  ignore_public_acls      = true

  depends_on = [aws_s3_bucket.default]
}

# ========================================
# Server Access Logging
# ========================================

resource "aws_s3_bucket_logging" "default" {
  bucket = aws_s3_bucket.default.id

  target_bucket = var.log-target-bucket
  target_prefix = var.log-target-prefix
}

# ========================================
# Bucket policy
# ========================================

resource "aws_s3_bucket_policy" "default" {
  bucket = aws_s3_bucket.default.id
  policy = data.aws_iam_policy_document.combined.json
}

data "aws_iam_policy_document" "default" {
  statement {
    sid    = "DenyInsecureCommunications"
    effect = "Deny"

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    actions = ["s3:*"]

    resources = [
      format("%s", aws_s3_bucket.default.arn),
      format("%s/*", aws_s3_bucket.default.arn)
    ]

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

## Custom policy required based on requirements able to add to the s3 bucket policy
data "aws_iam_policy_document" "combined" {
  source_policy_documents = compact([
    data.aws_iam_policy_document.default.json,
    var.policy ## your custom policy
  ])
}

## Server side encryption of s3 bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "default" {
  bucket = aws_s3_bucket.default.id

  dynamic "rule" {
    for_each = var.sse-algorithm == "aes256" ? ["aes256"] : []
    content {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  dynamic "rule" {
    for_each = var.sse-algorithm == "kms" ? ["kms"] : []
    content {
      apply_server_side_encryption_by_default {
        sse_algorithm     = "aws:kms"
        kms_master_key_id = var.kms-key
      }
      bucket_key_enabled = true
    }
  }
}

# ========================================
# versioning
# ========================================

resource "aws_s3_bucket_versioning" "default" {
  count = var.versioning_status == null ? 0 : 1

  bucket = aws_s3_bucket.default.id
  versioning_configuration {
    status = var.versioning_status
  }
}
