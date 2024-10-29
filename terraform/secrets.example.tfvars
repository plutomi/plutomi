# Sample file in what the secrets.tfvars file should look like
# You can then override these based on environment like :
# terraform apply -var-file secrets.tfvars -var-file secrets-production.tfvars

### Global
environment = "development"

### Cloudflare
cloudflare_account_id = "1234567890abcdef1234567890"
# https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
cloudflare_admin_token = "your-cloudflare-admin-token"

### Axiom
# Deployed once in development mode
axiom_admin_api_token = "abcd-efghijkl-lmno-pqrs-tuvw-xyz1234567890-production"
