#### AWS

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  default     = "10.0.1.0/24"
}


variable "home_ip" {
  description = "Your home IP address"
}



variable "environment" {
  description = "The environment for the deployment"
}
variable "base_url" {
  description = "The hostname of the base URL"
}

variable "contact_email" {
  description = "The contact email for the domain"
}

variable "ses_configuration_set_name" {
  description = "Name of the SES configuration set"
  default     = "ses-configuration-set"
}

variable "ses_events_topic_name" {
  description = "Name of the SNS topic for SES events"
  default     = "ses-events-topic"
}

variable "ses_event_destination_name" {
  description = "Name of the SES event destination"
  default     = "ses-event-destination"
}

variable "ses_events_queue_name" {
  description = "The name of the SQS events queue"
  default     = "ses-events-queue"
}

variable "mail_from_subdomain" {
  description = "The subdomain for the mail from domain"
}

variable "aws_region" {
  description = "The AWS region - typically us-east-1"
}

variable "aws_profile" {
  description = "The SSO profile for AWS"
}

variable "ecr_repositories" {
  type    = list(string)               # TODO add consumer
  default = ["web", "api", "migrator"] # plutomi-notifications-user-consumer etc.
}


#### Cloudflare

variable "cloudflare_admin_token" {
  # This should have Zone.Zone, Zone.DNS, and Account.WorkersR2Storage edit permissions
  description = "The admin token for creating the bucket storage bucket and managing SES DNS records"
  sensitive   = true
}

variable "cloudflare_zone_id" {
  # For MX, SPF, and DKIM records
  description = "The zone ID for Cloudflare"
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "The account ID for Cloudflare"
  sensitive   = true
}

variable "cloudflare_region" {
  # https://developers.cloudflare.com/load-balancing/reference/region-mapping-api/
  description = "The region for the Cloudflare bucket"
}

variable "cloudflare_bucket_name" {
  description = "The name of the R2 bucket for Cloudflare"
}

# #### Axiom
# Not currently used as this provider has a few issues
variable "axiom_admin_api_token" {
  description = "The admin API token for Axiom to create datasets and api keys"
  sensitive   = true
}


variable "cloudflare_ips" {
  // https://www.cloudflare.com/ips/
  type = list(string)
  default = [
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/13",
    "104.24.0.0/14",
    "172.64.0.0/13",
    "131.0.72.0/22"
  ]
}
