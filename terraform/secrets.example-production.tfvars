# Sample file in what the secrets.tfvars file should look like
# You can then override these based on environment like :
# terraform apply -var-file secrets.tfvars -var-file secrets-prod.tfvars

aws_profile = "plutomi-production" # <-- Replace this with your AWS profile
aws_region = "us-east-1" # <-- Replace this with your AWS region
environment = "production"

cloudflare_account_id = "1234567890abcdef1234567890-production"
# Used to create the bucket
cloudflare_r2_admin_token = "your-cloudflare-r2-admin-token-production"
cloudflare_bucket_name = "your-cloudflare-bucket-name-production"
cloudflare_bucket_region = "your-cloudflare-bucket-region-production"
