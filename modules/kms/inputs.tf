variable "name" {
  type        = string
  description = "Required. Name of the resource."
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Optional. Tags of the resource."
}

variable "enable_key_rotation" {
  type        = bool
  description = "Required. Specifies whether key rotation is enabled."
}

variable "policy" {
  default     = null
  description = "Optional"
}
