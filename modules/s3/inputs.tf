variable "name" {
  type        = string
  description = "Required. Name of the S3 bucket."
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Optional. Tags of the resource."
}

variable "policy" {
  type        = string
  default     = null
  description = "Optional. Policy statement for S3 bucket."
}

variable "force-destroy" {
  type        = bool
  default     = false
  description = "Optional. A boolean that indicates all objects (including any locked objects) should be deleted from the bucket so that the bucket can be destroyed without error. These objects are not recoverable."
}

variable "acl-type" {
  type        = string
  default     = "private"
  description = "Optional. ACL type for S3 bucket."
}

variable "sse-algorithm" {
  type        = string
  description = "Required. SSE algorithm use for the S3 bucket."
}

variable "kms-key" {
  type        = string
  default     = null
  description = "Optional. KMS key use for the S3 bucket if you using SSE-KMS."
}

variable "log-target-bucket" {
  type        = string
  description = "Required. The name of the bucket where you want Amazon S3 to store server access logs."
}

variable "log-target-prefix" {
  type        = string
  description = "Required. A prefix for all log object keys."
}

variable "versioning_status" {
  type        = string
  default     = null
  description = "Optional. Enabled or Disabled. Defaults to null."

  validation {
    condition     = var.versioning_status == null || var.versioning_status == "Enabled" || var.versioning_status == "Disabled"
    error_message = "The versioning status can only be null, 'Enabled' or 'Disabled'."
  }
}
