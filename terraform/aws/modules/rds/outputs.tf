output "db_endpoint" {
  description = "The endpoint of the RDS database"
  value       = aws_db_instance.postgres.endpoint
}

output "db_name" {
  description = "The name of the database"
  value       = aws_db_instance.postgres.db_name
}

output "db_username" {
  description = "The username for the database"
  value       = aws_db_instance.postgres.username
}

output "db_password" {
  description = "The password for the database"
  value       = random_password.db_password.result
  sensitive   = true
}
