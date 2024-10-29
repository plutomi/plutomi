# This creates an R2 bucket for blob storage on Cloudflare.

locals {
  bucket_name = {
    development = "plutomi-development-assets"
    staging     = "plutomi-staging-assets"
    production  = "plutomi-assets"
  }
  region = {
    # https://developers.cloudflare.com/load-balancing/reference/region-mapping-api/
    development = "ENAM"
    staging     = "ENAM"
    production  = "ENAM"
  }
}

resource "cloudflare_r2_bucket" "cloudflare-bucket" {
  account_id = var.cloudflare_account_id
  name       = local.bucket_name[var.environment]
  location   = local.region[var.environment]
}


## TODO Add DNS stuff here
