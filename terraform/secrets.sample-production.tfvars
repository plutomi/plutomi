# Sample file in what the secrets.tfvars file should look like
# You can then override these based on environment like :
# terraform apply -var-file secrets.tfvars -var-file secrets-prod.tfvars

aws_profile = "plutomi-production" # <-- Replace this with your AWS profile
aws_region = "us-east-1" # <-- Replace this with your AWS region
environment = "production"
