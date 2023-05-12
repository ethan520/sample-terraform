# Create Product Alpha VPC
resource "aws_vpc" "product_alpha_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
}

# Create Product Beta VPC
resource "aws_vpc" "product_beta_vpc" {
  cidr_block = "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
}

# Create VPC peering connection from Product Alpha VPC to Product Beta VPC
resource "aws_vpc_peering_connection" "alpha_to_beta_peering" {
  peer_vpc_id = aws_vpc.product_beta_vpc.id
  vpc_id = aws_vpc.product_alpha_vpc.id
  auto_accept = true
}

# Create VPC peering connection from Product Beta VPC to Product Alpha VPC
resource "aws_vpc_peering_connection" "beta_to_alpha_peering" {
  peer_vpc_id = aws_vpc.product_alpha_vpc.id
  vpc_id = aws_vpc.product_beta_vpc.id
  auto_accept = true
}

# Create route table for Product Alpha VPC
resource "aws_route_table" "product_alpha_route_table" {
  vpc_id = aws_vpc.product_alpha_vpc.id
}

# Create route for the Product Alpha VPC peering connection
resource "aws_route" "product_alpha_peering_route" {
  route_table_id = aws_route_table.product_alpha_route_table.id
  destination_cidr_block = aws_vpc.product_beta_vpc.cidr_block
  vpc_peering_connection_id = aws_vpc_peering_connection.alpha_to_beta_peering.id
}

# Create route table for Product Beta VPC
resource "aws_route_table" "product_beta_route_table" {
  vpc_id = aws_vpc.product_beta_vpc.id
}

# Create route for the Product Beta VPC peering connection
resource "aws_route" "product_beta_peering_route" {
  route_table_id = aws_route_table.product_beta_route_table.id
  destination_cidr_block = aws_vpc.product_alpha_vpc.cidr_block
  vpc_peering_connection_id = aws_vpc_peering_connection.beta_to_alpha_peering.id
}
