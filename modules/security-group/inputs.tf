variable "vpc-id" {
  type        = string
  description = "Required. Id of the VPC for the security group."
}

variable "rules" {
  type        = list(any)
  description = "Required. Security group rules to be added."
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Optional. Required if new security group. Tags of the resource."
}

variable "name" {
  type        = string
  default     = ""
  description = "Optional. Required if new security group. Name of the resource."
}

variable "description" {
  type        = string
  default     = ""
  description = "Optional. Required if new security group. Description for new security group."
}

variable "id" {
  type        = string
  default     = null
  description = "Optional. External security group id to create the rules in. Leaving this blank will create a new security group."
}
