# Sample file in what the secrets.tfvars file should look like
# You can then override these based on environment like :
# terraform apply -var-file secrets.tfvars -var-file secrets-production.tfvars

### Global
environment = "development"
base_url = "yourdomain.com"
contact_email = "you@yourdomain.com" # For DMARC reports


### AWS
mail_from_subdomain = "notifications-development"
aws_region = "us-east-1"
aws_profile = "your-profile-development"

### Cloudflare
cloudflare_account_id = "1234567890abcdef1234567890"
# https://developers.cloudflare.com/fundamentals/api/get-started/create-token/ / https://dash.cloudflare.com/profile/api-tokens
cloudflare_admin_token = "your-cloudflare-admin-token"
cloudflare_bucket_name = "your-bucket-development-assets"
cloudflare_zone_id = "your-cloudflare-account-id"
# https://developers.cloudflare.com/load-balancing/reference/region-mapping-api/
cloudflare_region = "ENAM"

### Axiom
# Deployed once in development mode
axiom_admin_api_token = "abcd-efghijkl-lmno-pqrs-tuvw-xyz1234567890-production"
