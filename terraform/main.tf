terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }

    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "~> 4"
    }
  }
  

  required_version = ">= 1.2.0"
}



#######################################
### AWS Configuration TBD
###
### This creates an SES identity, an SNS topic,
### and an SQS queue to be used for email notifications.
#######################################

provider "aws" {
  profile    = var.aws_profile
  region  = var.aws_region
}


# Queue for SES Events
resource "aws_sqs_queue" "events_queue" {
  name = var.ses_events_queue_name
  fifo_queue = false
  tags = {
    environment = var.environment
  }
}



# SES Configuration Set
resource "aws_ses_configuration_set" "ses_configuration_set" {
  name = var.ses_configuration_set_name
}

# SES Identity (Domain)
resource "aws_ses_domain_identity" "ses_email_identity" {
  domain = var.base_url

}

# Mail From Domain
resource "aws_ses_domain_mail_from" "mail_from_domain" {
  domain           = aws_ses_domain_identity.ses_email_identity.domain
  mail_from_domain = "${var.mail_from_subdomain}.${var.base_url}"
  behavior_on_mx_failure = "UseDefaultValue"
}

# SNS Topic
resource "aws_sns_topic" "ses_events_topic" {
  name         = var.ses_events_topic_name
  display_name = var.ses_events_topic_name
  tags = {
    environment = var.environment
  }
}

# SES Event Destination
resource "aws_ses_event_destination" "ses_event_destination" {
  configuration_set_name = aws_ses_configuration_set.ses_configuration_set.name
  name                   = var.ses_event_destination_name
  enabled                = true

  sns_destination {
    topic_arn = aws_sns_topic.ses_events_topic.arn
  }

    matching_types = [
    "send", 
    "delivery", 
    "bounce", 
    "complaint", 
    "reject", 
    "open", 
    "click", 
    "renderingFailure"
  ]
}

# SQS Queue Subscription
resource "aws_sns_topic_subscription" "ses_topic_subscription" {
  topic_arn = aws_sns_topic.ses_events_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.events_queue.arn
}

#######################################
### Cloudflare Configuration TBD
###
### This creates a Cloudflare DNS record for the domain with the results from the AWS configuration alongside an R2 bucket.
#######################################




provider "cloudflare" {
  api_token = var.cloudflare_r2_admin_token
}

resource "cloudflare_r2_bucket" "cloudflare-bucket" {
  account_id = var.cloudflare_account_id
  name       = var.cloudflare_bucket_name
  location   = var.cloudflare_bucket_region
}


#######################################
### Hetzner Configuration TBD
###
### This spins up 3 servers in Hetzner Cloud
#######################################




#######################################
### Axiom Configuration TBD
###
### This sets up two environments in Axiom for logging, a 'test' and 'production' environment. 'test' is used for anything not production.
#######################################

