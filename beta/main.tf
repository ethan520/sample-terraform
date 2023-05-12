locals {
  service-name = "beta"

  security-group-rules = concat([{
      type                     = "egress"
      from_port                = 0
      to_port                  = 443
      protocol                 = "tcp"
      source_security_group_id = data.aws_security_group.alpha.id
      description              = "Allow outbound traffic for Product Beta's services to reach Product Alpha's services"
    }, {
      type                     = "egress"
      from_port                = 5432
      to_port                  = 5432
      protocol                 = "tcp"
      source_security_group_id = module.product_beta_sg.security-group.id
      description              = "Allow outbound traffic through to Beta's rds"
  }])
}

# Create ECS service for Product Beta
resource "aws_ecs_service" "product_beta_service" {
  name            = "product-beta-service"
  task_definition = aws_ecs_task_definition.product_beta_task_definition.arn
  desired_count   = 2
  launch_type     = "EC2"

  network_configuration {
    subnets         = [data.aws_subnets.beta-app.ids]
    security_groups = [module.product_beta_sg.id]
  }
}

# Create ECS task definition for Product Beta
resource "aws_ecs_task_definition" "product_beta_task_definition" {
  family                   = "product-beta-task"
  container_definitions    = <<DEFINITION
[
  {
    "name": "product-beta-container",
    "image": "beta-ecr-image",
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

module "product_beta_sg" {
  source = "../modules/security-group"

  vpc-id      = var.vpc-id["beta"]
  name        = "product-beta-sg"
  description = "Security group for Product Beta's service"
  tags = {
    Name = format("%s-%s", terraform.workspace, local.service-name)
  }

  rules = local.security-group-rules
}