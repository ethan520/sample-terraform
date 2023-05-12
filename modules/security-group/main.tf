resource "aws_security_group" "default" {
  name        = var.name
  description = var.description
  vpc_id      = var.vpc-id

  tags = {
    Name = var.name
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group_rule" "default" {
  count = length(var.rules)
  security_group_id = aws_security_group.default.id

  type              = var.rules[count.index].type
  from_port         = var.rules[count.index].from_port
  to_port           = var.rules[count.index].to_port
  protocol          = var.rules[count.index].protocol
  description       = lookup(var.rules[count.index], "description", "Managed by Terraform")
  source_security_group_id = lookup(var.rules[count.index], "source_security_group_id", null)
}
