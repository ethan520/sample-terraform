variable "name" {
  type        = string
  description = "Required. Name of the log group as show in cloudwatch"
}

variable "retention-in-days" {
  type        = number
  default     = 7
  description = "Optional. Defaults to 7 days"
}

variable "kms-key-id" {
  type        = string
  default     = null
  description = "Optional. Id of the kms key to encrypt the log group with"
}

variable "tags" {
  type        = map(any)
  description = "Tags"
}

data "aws_caller_identity" "current" {}
