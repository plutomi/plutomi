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

# Retrieve the public IPs of the EC2 instances
locals {
  control_plane_ips = [
    for instance in aws_instance.control_plane_nodes : instance.public_ip
  ]
}

# Add DNS A records in Cloudflare pointing to each EC2 instance's public IP
resource "cloudflare_record" "control_plane_dns" {
  count   = length(local.control_plane_ips)   # Create one record per instance
  zone_id = var.cloudflare_zone_id            # Cloudflare Zone ID for your domain
  name    = "node-${count.index}.${var.base_url}"  # Adjust the subdomain name as needed
  type    = "A"
  ttl     = 300
  content = local.control_plane_ips[count.index]   # Public IP for the instance
  tags    = ["ec2", "control-plane", var.environment]

  # Ensure this resource depends on the EC2 instances being created
  depends_on = [aws_instance.control_plane_nodes]
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
