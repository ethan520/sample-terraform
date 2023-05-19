resource "aws_subnet" "app-alpha" {
  vpc_id                  = aws_vpc.product_alpha_vpc.id
  cidr_block              = "10.0.254.0/24"
  availability_zone       = "ap-southeast-1a"

  tags = {
    Name = format("%s-app-alpha", terraform.workspace)
    Tier = "app"
  }
}

resource "aws_subnet" "db-alpha" {
  vpc_id                  = aws_vpc.product_alpha_vpc.id
  cidr_block              = "10.0.255.0/24"
  availability_zone       = "ap-southeast-1a"
  tags = {
    Name = format("%s-db-alpha", terraform.workspace)
    Tier = "db"
  }
}

resource "aws_subnet" "app-beta" {
  vpc_id                  = aws_vpc.product_beta_vpc.id
  cidr_block              = "10.1.254.0/24"
  availability_zone       = "ap-southeast-1a"
  tags = {
    Name = format("%s-app-beta", terraform.workspace)
    Tier = "app"
  }
}

resource "aws_subnet" "db-beta" {
  vpc_id                  = aws_vpc.product_beta_vpc.id
  cidr_block              = "10.1.255.0/24"
  availability_zone       = "ap-southeast-1a"
  tags = {
    Name = format("%s-db-beta", terraform.workspace)
    Tier = "db"
  }
}

resource "aws_db_subnet_group" "default" {
  name       = format("%s-db_subnet_group", terraform.workspace)
  subnet_ids = [aws_subnet.db-alpha.id, aws_subnet.db-beta.id]

  tags = {
    Name = "My DB subnet group"
  }
}
