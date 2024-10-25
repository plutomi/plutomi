/**
*
* Secrets for AWS
* See secrets.sample.tfvars
*/
variable "aws_profile" {
  description = "The access key for AWS"
}

variable "aws_region" {
  description = "The region for AWS"
}

variable "environment" {
  description = "The environment for the deployment"
}
variable "base_url" {
  description = "The hostname of the base URL"
  default     = "plutomi.com"
}

variable "mail_from_subdomain" {
  description = "Subdomain for mail-from address for SES"
  default     = "notifications"
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


#### Cloudflare

variable "cloudflare_r2_admin_token" {
  description = "The R2 admin token for creating the bucket"
}

variable "cloudflare_bucket_name" {
    description = "The name of the bucket for Cloudflare"
}

variable "cloudflare_bucket_region" {
    description = "The region of the bucket for Cloudflare"
}

variable "cloudflare_account_id" {
    description = "The account ID for Cloudflare"
}
