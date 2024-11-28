# Sample file in what the secrets.tfvars file should look like
# You can then override these based on environment like :
# terraform apply -var-file secrets.tfvars -var-file secrets-production.tfvars

### Global
environment   = "development"
base_url      = "yourdomain.com"
contact_email = "you@yourdomain.com" # For DMARC reports


### AWS
mail_from_subdomain = "notifications-development"
aws_region          = "us-east-1"
aws_profile         = "your-profile-development"
home_ip             = "XXX.X.XXX.XX"
# TODO maybe no lnoger needed
aws_account_id      = "ABCDEF123456"


### Cloudflare
# https://developers.cloudflare.com/fundamentals/api/get-started/create-token/ / https://dash.cloudflare.com/profile/api-tokens
cloudflare_admin_token = "your-cloudflare-admin-token"
cloudflare_zone_id     = "your-cloudflare-account-id"

### Axiom
# Deployed once in development mode
axiom_admin_api_token = "abcd-efghijkl-lmno-pqrs-tuvw-xyz1234567890-production"
