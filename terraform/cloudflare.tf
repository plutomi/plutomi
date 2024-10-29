# This creates an R2 bucket for blob storage on Cloudflare.

resource "cloudflare_r2_bucket" "cloudflare-bucket" {
  account_id = var.cloudflare_account_id
  name       = var.cloudflare_bucket_name
  location   = var.cloudflare_bucket_region
}


## TODO Add DNS stuff here
