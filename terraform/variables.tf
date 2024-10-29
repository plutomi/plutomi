#### AWS
variable "environment" {
  description = "The environment for the deployment"
}
variable "base_url" {
  description = "The hostname of the base URL"
  default     = "plutomi.com"
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

#### Cloudflare

variable "cloudflare_admin_token" {
  # This should have Zone.Zone, Zone.DNS, and Account.WorkersR2Storage edit permissions
  description = "The admin token for creating the bucket storage bucket and managing SES DNS records"
}


variable "cloudflare_account_id" {
    description = "The account ID for Cloudflare"
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
}

