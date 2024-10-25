# Sample file in what the secrets.tfvars file should look like
# You can then override these based on environment like :
# terraform apply -var-file secrets.tfvars -var-file secrets-production.tfvars

aws_profile = "plutomi-development" # <-- Replace this with your AWS profile
aws_region = "us-east-1" # <-- Replace this with your AWS region
environment = "development"

cloudflare_account_id = "1234567890abcdef1234567890"
# This is the `T-` prefixed token on the dashboard used to create the bucket
cloudflare_r2_admin_token = "T-your-cloudflare-t2-admin-token"
cloudflare_bucket_name = "your-cloudflare-bucket-name"
cloudflare_bucket_region = "your-cloudflare-bucket-region"



axiom_admin_api_token = "abcd-efghijkl-lmno-pqrs-tuvw-xyz1234567890"
