output "instance" {
  value = {
    id      = aws_db_instance.default.id
    address = aws_db_instance.default.address
  }
}

output "security-group" {
  value = {
    id = module.security-group.id
  }
}

output "db_name" {
  value = aws_db_instance.default.db_name
}
