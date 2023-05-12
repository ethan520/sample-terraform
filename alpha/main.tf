locals {
  service-name = "alpha"

  security-group-rules = concat([{
      type                     = "ingress"
      from_port                = 0
      to_port                  = 443
      protocol                 = "tcp"
      source_security_group_id = data.aws_security_group.beta.id
      description              = "Allow inbound traffic for Product Beta's services to reach Product Alpha's services"
    }, {
      type                     = "egress"
      from_port                = 5432
      to_port                  = 5432
      protocol                 = "tcp"
      source_security_group_id = module.product_alpha_sg.security-group.id
      description              = "Allow outbound traffic through to Alpha's rds"
    }, {
      type                     = "egress"
      from_port                = 5432
      to_port                  = 5432
      protocol                 = "tcp"
      source_security_group_id = data.aws_security_group.beta-rds.id
      description              = "Allow outbound traffic through to Beta's rds"
  }])
}

# Create ECS service for Product Alpha
resource "aws_ecs_service" "product_alpha_service" {
  name            = "product-alpha-service"
  task_definition = aws_ecs_task_definition.product_alpha_task_definition.arn
  desired_count   = 2
  launch_type     = "EC2"

  network_configuration {
    subnets         = [data.aws_subnets.alpha-app.ids]
    security_groups = [module.product_alpha_sg.id]
  }
}

# Create ECS task definition for Product Alpha
resource "aws_ecs_task_definition" "product_alpha_task_definition" {
  family                   = "product-alpha-task"
  container_definitions    = <<DEFINITION
[
  {
    "name": "product-alpha-container",
    "image": "alpha-ecr-image",
    "portMappings": [
      {
        "containerPort": 80,
        "hostPort": 80,
        "protocol": "tcp"
      }
    ]
  }
]
DEFINITION

  cpu = "256"
  memory = "512"
  requires_compatibilities = ["EC2"]
  network_mode = "bridge"
}

# ========================================
# SECURITY GROUP
# ========================================

module "product_alpha_sg" {
  source = "../modules/security-group"

  vpc-id      = var.vpc-id["alpha"]
  name        = "product-alpha-sg"
  description = "Security group for Product Alpha's service"
  tags = {
    Name = format("%s-%s", terraform.workspace, local.service-name)
  }

  rules = local.security-group-rules
}