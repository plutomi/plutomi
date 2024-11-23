# This creates an R2 bucket for blob storage on Cloudflare.

resource "cloudflare_r2_bucket" "cloudflare-bucket" {
  account_id = var.cloudflare_account_id
  name       = var.cloudflare_bucket_name
  location   = var.cloudflare_region
}

# Mail From MX Record
resource "cloudflare_record" "mail_from_mx_record" {
  zone_id  = var.cloudflare_zone_id
  name     = "${var.mail_from_subdomain}.${var.base_url}"
  content  = "feedback-smtp.${var.aws_region}.amazonses.com"
  priority = "10"
  type     = "MX"
  ttl      = 300
  tags     = ["ses", "mail-from", var.environment]
}

# Mail From SPF Record
resource "cloudflare_record" "mail_from_spf_record" {
  zone_id = var.cloudflare_zone_id
  name    = "${var.mail_from_subdomain}.${var.base_url}"
  # Must be in quotes
  content = "\"v=spf1 include:amazonses.com ~all\""
  type    = "TXT"
  ttl     = 300
  tags    = ["ses", "mail-from", var.environment]
}

# DMARC Record
resource "cloudflare_record" "dmarc_record" {
  # Don't redeploy on staging / production
  count   = var.environment == "development" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "_dmarc.${var.base_url}"
  # Must be in quotes
  content = "\"v=DMARC1; p=none; rua=mailto:${var.contact_email}\""
  type    = "TXT"
  ttl     = 300
  tags    = ["ses", "dmarc", var.environment]
}


# DKIM CNAME records
resource "cloudflare_record" "dkim_records" {
  count      = 3
  zone_id    = var.cloudflare_zone_id
  name       = "${aws_ses_domain_dkim.ses_dkim.dkim_tokens[count.index]}._domainkey"
  content    = "${aws_ses_domain_dkim.ses_dkim.dkim_tokens[count.index]}.dkim.amazonses.com"
  type       = "CNAME"
  ttl        = 300
  depends_on = [aws_ses_domain_dkim.ses_dkim]
  tags       = ["ses", "dkim", var.environment]
}

# Create a local variable to hold the first domain validation option
locals {
  validation_option = [for dvo in aws_acm_certificate.alb_certificate_plutomi.domain_validation_options : dvo][0]
}


# Add the ACM certificate validation records# Add the ACM certificate validation record
resource "cloudflare_record" "acm_certificate_validation" {
  zone_id = var.cloudflare_zone_id
  name    = local.validation_option.resource_record_name
  type    = local.validation_option.resource_record_type
  content = local.validation_option.resource_record_value
  ttl     = 300
}


resource "cloudflare_record" "alb_dns_record" {
  zone_id = var.cloudflare_zone_id
  name    = var.base_url
  type    = "CNAME"

  content = aws_lb.application_load_balancer.dns_name
  ttl     = 1
  proxied = true
  tags    = [var.environment, "alb"]

}


resource "cloudflare_record" "alb_dns_subdomain_record" {
  zone_id = var.cloudflare_zone_id
  name    = "*.${var.base_url}"
  type    = "CNAME"

  content = aws_lb.application_load_balancer.dns_name
  ttl     = 1
  proxied = true
  tags    = [var.environment, "alb"]

}
